const { app, BrowserWindow, ipcMain, dialog, shell } = require("electron");
const path = require("node:path");
const fs = require("node:fs");
const os = require("node:os");
const { spawn } = require("node:child_process");
const { randomUUID } = require("node:crypto");

// When the app is launched from Finder (packaged build), process.env.PATH is
// minimal and won't include user's shell additions (e.g. /opt/homebrew/bin,
// ~/.local/bin where whisper/claude typically live). fix-path inspects the
// user's login shell and merges their PATH. No-op in development.
const PATH_BEFORE_FIX = process.env.PATH || "";
try { require("fix-path")(); } catch (e) {
  console.error("[recast] fix-path failed:", e);
}
const PATH_AFTER_FIX = process.env.PATH || "";

const WHISPER_MODEL = process.env.RECAST_WHISPER_MODEL || "Xenova/whisper-base";

// ---------- Claude CLI resolver ----------
// Finder-launched apps have a bare PATH (/usr/bin:/bin:/usr/sbin:/sbin) and
// fix-path sometimes can't read the user's shell config (e.g. if $SHELL is
// /bin/sh, or when claude is defined only as an alias/function). Try multiple
// strategies in order and cache the result.

let claudeCmdCache = null;

function candidatePaths() {
  const home = os.homedir();
  const xs = [
    process.env.RECAST_CLAUDE_CMD,
    // Common install locations
    path.join(home, ".claude/local/claude"),
    path.join(home, ".claude/local/bin/claude"),
    path.join(home, ".local/bin/claude"),
    "/opt/homebrew/bin/claude",
    "/usr/local/bin/claude",
    path.join(home, ".npm-global/bin/claude"),
    path.join(home, ".volta/bin/claude"),
    path.join(home, ".bun/bin/claude"),
    "/Applications/Claude.app/Contents/Resources/app.asar.unpacked/bin/claude",
  ];
  return xs.filter(Boolean);
}

function resolveFromPath(pathEnv) {
  const dirs = (pathEnv || "").split(path.delimiter).filter(Boolean);
  for (const d of dirs) {
    const p = path.join(d, "claude");
    try { if (fs.statSync(p).isFile()) return p; } catch {}
  }
  return null;
}

function resolveViaLoginShell() {
  // Last resort: run user's login shell to resolve `claude`.
  const shell = process.env.SHELL || "/bin/zsh";
  try {
    const { execFileSync } = require("node:child_process");
    const out = execFileSync(shell, ["-ilc", "command -v claude"], {
      encoding: "utf-8", timeout: 3000, stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    if (out && fs.existsSync(out)) return out;
  } catch {}
  return null;
}

function findClaudeCmd() {
  if (claudeCmdCache) return claudeCmdCache;
  for (const p of candidatePaths()) {
    try { if (fs.statSync(p).isFile()) return (claudeCmdCache = p); } catch {}
  }
  const fromPath = resolveFromPath(process.env.PATH);
  if (fromPath) return (claudeCmdCache = fromPath);
  const fromShell = resolveViaLoginShell();
  if (fromShell) return (claudeCmdCache = fromShell);
  return null;
}

function claudeDiagnostic() {
  return [
    `SHELL: ${process.env.SHELL || "(unset)"}`,
    `isPackaged: ${app.isPackaged}`,
    `PATH before fix-path: ${PATH_BEFORE_FIX.slice(0, 500) || "(empty)"}`,
    `PATH after fix-path:  ${PATH_AFTER_FIX.slice(0, 500) || "(empty)"}`,
    `PATH now:             ${(process.env.PATH || "").slice(0, 500)}`,
    `RECAST_CLAUDE_CMD: ${process.env.RECAST_CLAUDE_CMD || "(unset)"}`,
    `Checked candidates:`,
    ...candidatePaths().map(p => {
      let exists = "x";
      try { exists = fs.statSync(p).isFile() ? "O" : "x"; } catch {}
      return `  [${exists}] ${p}`;
    }),
  ].join("\n");
}

// Log the real cause instead of Electron's cryptic "undefined: undefined".
process.on("uncaughtException", (err) => {
  console.error("[recast] uncaught:", err?.stack || err);
  try {
    require("electron").dialog.showErrorBox(
      "Recast 시작 실패",
      (err?.stack || String(err)).slice(0, 2000)
    );
  } catch {}
});

function resolveFfmpegPath() {
  try {
    const inst = require("@ffmpeg-installer/ffmpeg");
    if (!inst?.path) {
      throw new Error(
        `@ffmpeg-installer/ffmpeg가 '${process.platform}-${process.arch}' ` +
        `바이너리를 찾지 못했습니다. 이 DMG가 올바른 아키텍처(${process.arch})인지 확인해주세요.`
      );
    }
    // When packaged, binaries must run from the unpacked dir (not inside asar).
    return inst.path.replace(
      `app.asar${path.sep}node_modules`,
      `app.asar.unpacked${path.sep}node_modules`
    );
  } catch (err) {
    console.error("[recast] ffmpeg resolve failed:", err);
    throw err;
  }
}

let asrPipelinePromise = null;

async function getAsrPipeline({ log, progress }) {
  if (asrPipelinePromise) return asrPipelinePromise;
  asrPipelinePromise = (async () => {
    const tf = await import("@huggingface/transformers");
    tf.env.cacheDir = path.join(userData(), "models");
    tf.env.localModelPath = path.join(userData(), "models");
    log?.("info", "transcribe",
      `모델 로드 · ${WHISPER_MODEL} (최초 1회 다운로드, ~150MB)`);
    return tf.pipeline("automatic-speech-recognition", WHISPER_MODEL, {
      progress_callback: (p) => {
        if (p?.status === "progress" && p.total) {
          const done = Math.round(p.progress);
          log?.("dim", "transcribe",
            `${p.file || "model"} · ${done}%`);
        } else if (p?.status === "done" || p?.status === "ready") {
          log?.("ok", "transcribe", `모델 준비 완료`);
        }
      },
    });
  })();
  asrPipelinePromise.catch(() => { asrPipelinePromise = null; });
  return asrPipelinePromise;
}

let mainWindow = null;
let currentJob = null;

const userData = () => app.getPath("userData");
const dbPath = () => path.join(userData(), "recordings.json");
const audioDir = () => path.join(userData(), "audio");

function ensureDirs() {
  fs.mkdirSync(audioDir(), { recursive: true });
}
function loadDB() {
  try {
    return JSON.parse(fs.readFileSync(dbPath(), "utf-8"));
  } catch { return { recordings: [] }; }
}
function saveDB(db) {
  fs.writeFileSync(dbPath(), JSON.stringify(db, null, 2), "utf-8");
}
function emitLibraryChanged() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  mainWindow.webContents.send("library:changed");
}

function createWindow() {
  const iconPath = path.join(__dirname, "build", "icon.png");
  const iconExists = (() => { try { return fs.existsSync(iconPath); } catch { return false; } })();
  mainWindow = new BrowserWindow({
    width: 1360,
    height: 900,
    minWidth: 980,
    minHeight: 640,
    backgroundColor: "#F5F5F7",
    ...(iconExists ? { icon: iconPath } : {}),
    titleBarStyle: process.platform === "darwin" ? "hidden" : "default",
    trafficLightPosition: process.platform === "darwin"
      ? { x: 18, y: 20 } : undefined,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false,
    },
  });
  mainWindow.loadFile(path.join(__dirname, "Recast.html"));
}

app.whenReady().then(() => {
  try { ensureDirs(); } catch (e) { console.error("[recast] ensureDirs failed:", e); }
  if (process.platform === "darwin" && !app.isPackaged && app.dock) {
    try { app.dock.setIcon(path.join(__dirname, "build", "icon.png")); } catch {}
  }
  try { createWindow(); }
  catch (e) {
    console.error("[recast] createWindow failed:", e);
    dialog.showErrorBox("Recast 시작 실패", (e?.stack || String(e)).slice(0, 2000));
  }
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
}).catch((e) => {
  console.error("[recast] app.whenReady failed:", e);
  try { dialog.showErrorBox("Recast 시작 실패", (e?.stack || String(e)).slice(0, 2000)); } catch {}
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// ------------------- Recordings store IPC -------------------

ipcMain.handle("recordings:list", () => loadDB().recordings);
ipcMain.handle("recordings:get", (_e, id) => {
  return loadDB().recordings.find(r => r.id === id) || null;
});
ipcMain.handle("recordings:delete", (_e, id) => {
  const db = loadDB();
  const rec = db.recordings.find(r => r.id === id);
  db.recordings = db.recordings.filter(r => r.id !== id);
  saveDB(db);
  if (rec?.audioPath && rec.audioPath.startsWith(audioDir())) {
    try { fs.unlinkSync(rec.audioPath); } catch {}
  }
  emitLibraryChanged();
  return true;
});
ipcMain.handle("recordings:toggleStar", (_e, id) => {
  const db = loadDB();
  const r = db.recordings.find(x => x.id === id);
  if (!r) return false;
  r.starred = !r.starred;
  saveDB(db);
  emitLibraryChanged();
  return r.starred;
});

ipcMain.handle("recordings:exportMarkdown", async (_e, id) => {
  const rec = loadDB().recordings.find(r => r.id === id);
  if (!rec) return { ok: false, error: "녹음을 찾을 수 없습니다." };
  const md = buildMarkdown(rec);
  const r = await dialog.showSaveDialog(mainWindow, {
    title: "Markdown으로 내보내기",
    defaultPath: `${safeFilename(rec.title || "recording")}.md`,
    filters: [{ name: "Markdown", extensions: ["md"] }],
  });
  if (r.canceled || !r.filePath) return { ok: false };
  fs.writeFileSync(r.filePath, md, "utf-8");
  shell.showItemInFolder(r.filePath);
  return { ok: true, filePath: r.filePath };
});

// ------------------- Analyze pipeline -------------------

ipcMain.handle("dialog:pickAudio", async () => {
  const r = await dialog.showOpenDialog(mainWindow, {
    title: "녹음 파일 선택",
    properties: ["openFile"],
    filters: [
      { name: "Audio", extensions: ["m4a", "mp3", "wav", "aac", "flac", "ogg", "webm"] },
      { name: "All", extensions: ["*"] },
    ],
  });
  if (r.canceled || !r.filePaths[0]) return null;
  return r.filePaths[0];
});

ipcMain.handle("analyze:cancel", () => {
  if (currentJob) currentJob.cancelled = true;
  if (currentJob?.child) { try { currentJob.child.kill(); } catch {} }
});

ipcMain.handle("analyze:start", async (_e, audioPath) => {
  if (currentJob) return { ok: false, error: "이미 분석이 진행 중입니다." };
  if (!audioPath || !fs.existsSync(audioPath)) {
    return { ok: false, error: "파일을 찾을 수 없습니다." };
  }

  const job = { cancelled: false, child: null };
  currentJob = job;

  const send = (evt) => {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    mainWindow.webContents.send("analyze:event", evt);
  };
  const now = () => new Date().toTimeString().slice(0, 8);
  const log = (kind, source, message) =>
    send({ type: "log", t: now(), k: kind, s: source, m: message });
  const stage = (name) => send({ type: "stage", stage: name });
  const progress = (value) => send({ type: "progress", value });

  try {
    const id = randomUUID();
    const ext = path.extname(audioPath) || ".m4a";
    const storedAudioPath = path.join(audioDir(), `${id}${ext}`);
    fs.copyFileSync(audioPath, storedAudioPath);

    const stat = fs.statSync(storedAudioPath);
    const base = path.basename(audioPath);
    const sizeMB = (stat.size / (1024 * 1024)).toFixed(1);
    log("info", "claude-cli", `analyze 시작 · ${base}`);
    log("dim", "claude-cli", `${ext.slice(1)} · ${sizeMB} MB`);

    stage("transcribe");
    progress(0.05);
    const whisper = await runWhisper(storedAudioPath, job, { log, progress });
    if (job.cancelled) throw new Error("취소됨");
    log("ok", "transcribe",
      `완료 · ${whisper.segments.length}개 세그먼트 · ${formatDuration(whisper.durationSec)}`);
    progress(0.55);

    stage("summarize");
    log("info", "claude", "요약 생성 중 · claude CLI");
    const summary = await runClaude(whisper.text, job, { log, progress });
    if (job.cancelled) throw new Error("취소됨");
    progress(0.98);
    log("ok", "claude", "요약 완료");

    const rec = buildRecording({
      id, base, ext, storedAudioPath, sizeMB,
      whisper, summary,
    });

    const db = loadDB();
    db.recordings = [rec, ...db.recordings];
    saveDB(db);
    emitLibraryChanged();

    progress(1);
    send({ type: "result", data: rec });
    return { ok: true, result: rec };
  } catch (err) {
    log("err", "recast", String(err?.message || err));
    send({ type: "error", message: String(err?.message || err) });
    return { ok: false, error: String(err?.message || err) };
  } finally {
    currentJob = null;
  }
});

async function runWhisper(audioPath, job, { log, progress }) {
  const pcm = await decodeToPcm(audioPath, job, { log });
  if (job.cancelled) throw new Error("취소됨");
  progress(0.28);
  log("ok", "transcribe",
    `PCM 디코딩 · ${(pcm.length * 4 / 1024 / 1024).toFixed(1)}MB · ` +
    `${formatDuration(pcm.length / 16000)}`);

  const pipe = await getAsrPipeline({ log, progress });
  if (job.cancelled) throw new Error("취소됨");
  progress(0.32);

  const audioSec = pcm.length / 16000;
  const chunkSec = 30, strideSec = 5;
  const estChunks = Math.max(1, Math.ceil(audioSec / (chunkSec - strideSec)));
  log("info", "transcribe",
    `추론 시작 · whisper (WASM) · ${formatDuration(audioSec)} → 예상 청크 ${estChunks}개`);

  // Heartbeat so the user sees time passing even when transformers.js is
  // busy between chunk_callback fires (WASM runs synchronously for a while).
  const hbStart = Date.now();
  const hb = setInterval(() => {
    if (job.cancelled) return;
    const s = Math.round((Date.now() - hbStart) / 1000);
    log("dim", "transcribe", `추론 중... ${s}s 경과`);
  }, 5000);

  let chunkCount = 0;
  let result;
  try {
    result = await pipe(pcm, {
      chunk_length_s: chunkSec,
      stride_length_s: strideSec,
      return_timestamps: true,
      language: "korean",
      task: "transcribe",
      chunk_callback: (chunk) => {
        chunkCount++;
        const ratio = Math.min(1, chunkCount / estChunks);
        const pct = 0.32 + ratio * 0.2; // whisper owns 0.32..0.52 of overall
        progress(pct);
        const t1 = chunk?.timestamp?.[1];
        const stamp = typeof t1 === "number" ? formatDuration(t1) : "";
        log("ok", "transcribe",
          `청크 ${chunkCount}/${estChunks} 완료${stamp ? ` · ~${stamp}` : ""}`);
      },
    });
  } finally {
    clearInterval(hb);
  }

  const chunks = Array.isArray(result?.chunks) ? result.chunks : [];
  const segments = chunks.map(c => ({
    start: c.timestamp?.[0] ?? 0,
    end: c.timestamp?.[1] ?? 0,
    text: (c.text || "").trim(),
  })).filter(s => s.text);
  const durationSec = segments.length
    ? segments[segments.length - 1].end
    : pcm.length / 16000;

  return {
    text: segments.map(s => s.text).join("\n") || result?.text || "",
    segments, durationSec, language: "ko",
  };
}

function decodeToPcm(audioPath, job, { log }) {
  // ffmpeg: decode anything -> 16kHz mono Float32LE raw PCM on stdout.
  return new Promise((resolve, reject) => {
    const args = [
      "-hide_banner", "-loglevel", "error",
      "-i", audioPath,
      "-ar", "16000", "-ac", "1",
      "-f", "f32le", "-acodec", "pcm_f32le",
      "pipe:1",
    ];
    log("info", "transcribe", `ffmpeg -ar 16000 -ac 1 -f f32le`);
    const child = spawn(resolveFfmpegPath(), args);
    job.child = child;

    const chunks = [];
    let size = 0;
    child.stdout.on("data", (d) => { chunks.push(d); size += d.length; });
    child.stderr.on("data", (d) => {
      d.toString().split(/\r?\n/).filter(Boolean).forEach(l =>
        log("dim", "transcribe", `ffmpeg: ${l}`.slice(0, 200)));
    });
    child.on("error", reject);
    child.on("close", (code) => {
      job.child = null;
      if (code !== 0) return reject(new Error(`ffmpeg 종료 코드 ${code}`));
      const buf = Buffer.concat(chunks, size);
      // Buffer → Float32Array (same memory, no copy)
      const pcm = new Float32Array(buf.buffer, buf.byteOffset, buf.byteLength / 4);
      resolve(pcm);
    });
  });
}

const CLAUDE_PROMPT = `당신은 회의/녹음 요약 어시스턴트입니다. 아래 트랜스크립트를 한국어로 분석하여 **순수 JSON만** 출력하세요. 코드 블록이나 설명 없이 JSON 본문만 출력합니다.

## 작성 원칙
- 제목은 회의의 핵심 주제를 드러내는 긴 문장으로 작성. 필요하면 콜론(:)으로 부제를 붙여 구체화. (예: "서비스 플랫폼 개선 전략 회의: 대시보드 UI/UX 개편 및 핵심 기능 재구성 논의")
- \`overview\`는 회의 전체를 2~4문장으로 압축한 문단. 주제·목표·핵심 결과를 포함.
- \`sections\`는 내용에 따라 **유동적으로** 구성. 가능한 섹션 예시: "회의 개요", "주요 논의 사항", "주요 결정 사항", "다음 행동 계획", "기술적 구현 방안", "식별된 과제 및 리스크", "질의응답 및 확인 사항", "데이터 처리 및 개인정보 보호", "향후 고려 사항" 등. 회의에 해당되는 섹션만 선택해서 포함.
- 각 섹션의 \`bullets\`는 "**레이블: 구체적 설명**" 형식을 선호. 레이블이 어색하면 일반 문장도 허용.
- 섹션은 최소 2개, 최대 8개.

## 스키마
{
  "title": "긴 제목 (부제 포함 가능)",
  "tldr": "한 줄 요약 (리스트 미리보기용, 1~2 문장)",
  "overview": "개요 문단 (2~4 문장)",
  "sections": [
    {
      "heading": "섹션 제목",
      "bullets": [
        "레이블: 구체적 설명",
        "일반 문장도 허용"
      ]
    }
  ],
  "speakers": ["화자 이름 (추정)"],
  "tags": ["주제 태그"]
}

## 트랜스크립트
`;

function runClaude(transcript, job, { log, progress }) {
  return new Promise((resolve, reject) => {
    const claudeCmd = findClaudeCmd();
    if (!claudeCmd) {
      const msg =
        "'claude' 실행 파일을 찾을 수 없습니다.\n\n" +
        "아래 중 하나로 해결할 수 있습니다:\n" +
        "1. 터미널에서 'which claude' 실행 → 나온 경로를 복사\n" +
        "2. 시스템 설정 → 환경변수에 RECAST_CLAUDE_CMD=<그 경로> 추가 후 앱 재시작\n" +
        "3. 또는 claude를 /opt/homebrew/bin, /usr/local/bin, ~/.local/bin 중 한 곳에 symlink\n\n" +
        "--- 진단 정보 ---\n" + claudeDiagnostic();
      log("err", "claude", "claude 실행 파일을 찾지 못함");
      claudeDiagnostic().split("\n").forEach(l => log("dim", "claude", l));
      return reject(new Error(msg));
    }

    const prompt = CLAUDE_PROMPT + "\n" + transcript;
    log("dim", "claude", `${claudeCmd} -p <stdin · ${prompt.length.toLocaleString()} chars>`);
    // Enrich PATH so any tools claude shells out to (node, etc.) are findable.
    const home = os.homedir();
    const enrichedPath = Array.from(new Set([
      path.dirname(claudeCmd),
      `${home}/.local/bin`,
      "/opt/homebrew/bin",
      "/usr/local/bin",
      "/usr/bin", "/bin", "/usr/sbin", "/sbin",
      ...(process.env.PATH || "").split(path.delimiter),
    ].filter(Boolean))).join(path.delimiter);
    const child = spawn(claudeCmd, ["-p"], {
      env: { ...process.env, PATH: enrichedPath },
    });
    job.child = child;
    child.stdin.write(prompt);
    child.stdin.end();

    let stdout = "";
    let stderr = "";
    let pct = 0.6;
    const bump = () => { pct = Math.min(pct + 0.04, 0.95); progress(pct); };

    child.stdout.on("data", (d) => { stdout += d.toString(); bump(); });
    child.stderr.on("data", (d) => {
      stderr += d.toString();
      d.toString().split(/\r?\n/).filter(Boolean).forEach(l =>
        log("dim", "claude", l.slice(0, 200)));
    });
    child.on("error", (err) => {
      if (err.code === "ENOENT") {
        reject(new Error(
          `'${claudeCmd}' 실행 중 ENOENT. 바이너리는 찾았지만 실행할 수 없습니다. ` +
          `파일이 심링크이고 대상이 존재하지 않거나 실행 권한이 없을 수 있습니다.\n\n` +
          claudeDiagnostic()
        ));
      } else reject(err);
    });
    child.on("close", (code) => {
      job.child = null;
      if (code !== 0) {
        return reject(new Error(`claude 종료 코드 ${code} · ${stderr.slice(0, 200)}`));
      }
      const json = extractJson(stdout);
      if (!json) {
        log("err", "claude", `JSON 파싱 실패 · 원본 ${stdout.length}자`);
        return reject(new Error("Claude 응답에서 JSON을 찾지 못했습니다."));
      }
      resolve(json);
    });
  });
}

function extractJson(text) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  try { return JSON.parse(text.slice(start, end + 1)); } catch { return null; }
}

function buildRecording({ id, base, ext, storedAudioPath, sizeMB, whisper, summary }) {
  const date = new Date();
  const durationSec = Math.round(whisper.durationSec || 0);
  const sections = normalizeSections(summary);
  return {
    id,
    title: summary.title || base.replace(/\.[^.]+$/, ""),
    source: "Import",
    createdAt: date.toISOString(),
    date: date.toLocaleString("ko-KR"),
    dateShort: date.toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" }),
    duration: formatDuration(durationSec),
    durationSec,
    size: `${sizeMB} MB`,
    status: "done",
    starred: false,
    audioPath: storedAudioPath,
    sourceFile: base,
    speakers: summary.speakers || [],
    tags: summary.tags || [],
    tldr: summary.tldr || (summary.overview ? summary.overview.split(/[.。]/)[0] : ""),
    overview: summary.overview || "",
    sections,
    transcript: (whisper.segments || []).map(s => ({
      t: formatDuration(Math.floor(s.start)),
      who: "",
      text: s.text,
    })),
    transcriptRaw: whisper.text,
    language: whisper.language,
  };
}

// Accept both the new `sections` schema and legacy keyPoints/chapters/actionItems
// so partial Claude outputs still render usefully.
function normalizeSections(summary) {
  if (Array.isArray(summary.sections) && summary.sections.length > 0) {
    return summary.sections.map(s => ({
      heading: String(s.heading || "").trim() || "섹션",
      bullets: (s.bullets || []).map(b => String(b).trim()).filter(Boolean),
    })).filter(s => s.bullets.length > 0);
  }
  const out = [];
  if (summary.keyPoints?.length) {
    out.push({ heading: "핵심 포인트", bullets: summary.keyPoints.map(String) });
  }
  if (summary.actionItems?.length) {
    out.push({
      heading: "다음 행동 계획",
      bullets: summary.actionItems.map(a =>
        typeof a === "string" ? a
          : [a.who, a.text, a.due].filter(Boolean).join(" · ")
      ),
    });
  }
  return out;
}

function buildMarkdown(rec) {
  const lines = [];
  const minutes = rec.durationSec
    ? `${Math.round(rec.durationSec / 60)} mins`
    : rec.duration || "";
  const dateOnly = rec.createdAt ? rec.createdAt.slice(0, 10) : rec.date || "";

  lines.push(`# ${rec.title || "녹음"}`);
  lines.push("");

  // Metadata as a compact list.
  const meta = [];
  if (dateOnly) meta.push(`- **Date**: ${dateOnly}`);
  if (minutes) meta.push(`- **Duration**: ${minutes}`);
  if (rec.speakers?.length) meta.push(`- **화자**: ${rec.speakers.join(", ")}`);
  if (rec.tags?.length) meta.push(`- **태그**: ${rec.tags.join(", ")}`);
  if (meta.length) {
    lines.push(...meta);
    lines.push("");
  }

  if (rec.tldr) {
    lines.push("> " + rec.tldr);
    lines.push("");
  }

  if (rec.overview) {
    lines.push("## 요약");
    lines.push("");
    lines.push(rec.overview);
    lines.push("");
  }

  for (const sec of rec.sections || []) {
    if (!sec.bullets?.length) continue;
    lines.push(`## ${sec.heading}`);
    lines.push("");
    for (const raw of sec.bullets) {
      const text = String(raw).trim();
      const m = text.match(/^([^:：]{1,40})[:：]\s*(.+)$/s);
      if (m) {
        lines.push(`- **${m[1]}**: ${m[2]}`);
      } else {
        lines.push(`- ${text}`);
      }
    }
    lines.push("");
  }

  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd() + "\n";
}

function safeFilename(name) {
  return String(name).replace(/[\\/:*?"<>|]/g, "_").slice(0, 80);
}

function formatDuration(sec) {
  sec = Math.max(0, Math.floor(sec || 0));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}
