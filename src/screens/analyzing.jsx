// Analyzing screen & the CLI log console

function CliConsole({ compact, fileLabel }) {
  const { t } = useTheme();
  const analyzer = useAnalyzer?.();
  const live = analyzer?.available && analyzer.state.logs.length > 0;

  const [mockLines, setMockLines] = React.useState(CLI_LOG.slice(0, 6));
  React.useEffect(() => {
    if (live) return;
    let i = 6;
    const id = setInterval(() => {
      if (i >= CLI_LOG.length) { clearInterval(id); return; }
      setMockLines(l => [...l, CLI_LOG[i]]);
      i++;
    }, 1200);
    return () => clearInterval(id);
  }, [live]);

  const lines = live ? analyzer.state.logs : mockLines;
  const header = fileLabel
    || (live ? `analyze · ${analyzer.state.stage || "running"}` : "analyze 1-1_recording.m4a");
  const running = live ? analyzer.state.status === "running" : true;

  const maxH = compact ? 140 : 220;
  const kindColor = (k) => ({
    info: "#8AB8FF", ok: "#7ADDB8", dim: t.codeDim, err: "#FF7557"
  }[k] || t.codeText);
  return (
    <div style={{
      width: compact ? 520 : "100%",
      background: t.codeBg, borderRadius: 8,
      border: `0.5px solid ${t.hair}`,
      fontFamily: FONT_MONO, fontSize: 11, color: t.codeText,
      overflow: "hidden",
    }}>
      <div style={{
        padding: "7px 12px",
        display: "flex", alignItems: "center", gap: 8,
        borderBottom: "0.5px solid rgba(255,255,255,0.08)",
        fontSize: 10.5, color: t.codeDim, letterSpacing: "0.04em",
      }}>
        <IconTerminal size={11} color={t.codeDim} />
        <span style={{ textTransform: "uppercase", fontWeight: 600 }}>claude-cli</span>
        <span>—</span>
        <span>{header}</span>
        <div style={{ flex: 1 }} />
        {running && <span className="pulse-dot" style={{
          width: 6, height: 6, borderRadius: "50%", background: "#7ADDB8",
        }}/>}
      </div>
      <div style={{
        padding: "8px 12px",
        maxHeight: maxH, overflow: "auto",
      }}>
        {lines.map((l, i) => (
          <div key={i} style={{
            display: "grid", gridTemplateColumns: "66px 76px 1fr",
            gap: 8, lineHeight: 1.7,
            opacity: i > lines.length - 4 ? 1 : 0.6,
          }}>
            <span style={{ color: t.codeDim }}>{l.t}</span>
            <span style={{ color: kindColor(l.k) }}>{l.s}</span>
            <span style={{
              color: l.k === "dim" ? t.codeDim : l.k === "err" ? "#FF9A85" : t.codeText,
              whiteSpace: "pre-wrap", wordBreak: "break-word"
            }}>{l.m}</span>
          </div>
        ))}
        {running && <LiveCaretRow analyzer={analyzer} live={live} t={t} />}
      </div>
    </div>
  );
}

function LiveCaretRow({ analyzer, live, t }) {
  // "Elapsed since last log" tick so users can see time is passing
  // even when the underlying task (whisper WASM) emits no output.
  const [tick, setTick] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => setTick(x => x + 1), 500);
    return () => clearInterval(id);
  }, []);

  const lastLog = live && analyzer.state.logs.length > 0
    ? analyzer.state.logs[analyzer.state.logs.length - 1]
    : null;
  const stage = live ? analyzer.state.stage : null;
  const source = stage === "summarize" ? "claude"
    : stage === "transcribe" ? "transcribe"
    : (lastLog?.s || "recast");
  const sourceColor = source === "claude" ? t.codeAccent
    : source === "transcribe" ? "#8AB8FF" : t.codeDim;

  // Elapsed seconds since the last log entry.
  // We only need this for display — re-compute on each tick.
  const [elapsed, setElapsed] = React.useState(0);
  React.useEffect(() => { setElapsed(0); }, [live ? analyzer.state.logs.length : 0]);
  React.useEffect(() => { setElapsed(x => x + 0.5); }, [tick]);

  const spinner = "⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏"[tick % 10];
  const hint = elapsed > 3
    ? `처리 중... ${Math.round(elapsed)}s`
    : "";

  return (
    <div style={{
      display: "grid", gridTemplateColumns: "66px 76px 1fr",
      gap: 8, lineHeight: 1.7,
    }}>
      <span style={{ color: t.codeDim }}>
        {new Date().toTimeString().slice(0, 8)}
      </span>
      <span style={{ color: sourceColor }}>{source}</span>
      <span style={{ color: t.codeDim }}>
        <span style={{ color: t.codeAccent, marginRight: 8, display: "inline-block", width: 10 }}>
          {spinner}
        </span>
        {hint}
        <span className="caret" style={{
          display: "inline-block", width: 7, height: 12, marginLeft: 4,
          background: t.codeText, verticalAlign: "text-bottom"
        }}/>
      </span>
    </div>
  );
}

Object.assign(window, { CliConsole, LiveCaretRow });
