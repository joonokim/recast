// Full-screen live overlay shown while a real analyze job is running,
// and after it finishes until the user dismisses it.

function AnalyzingOverlay() {
  const analyzer = useAnalyzer?.();
  const { t } = useTheme();
  if (!analyzer) return null;
  const { status, progress, result, error, logs } = analyzer.state;
  // Auto-dismiss after completion — the detail view now shows the result.
  React.useEffect(() => {
    if (status !== "done") return;
    const id = setTimeout(() => analyzer.reset(), 900);
    return () => clearTimeout(id);
  }, [status]);
  const visible = status === "running" || status === "error" || status === "done";
  if (!visible) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(10,10,12,0.45)",
      backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 40, boxSizing: "border-box",
      fontFamily: FONT_UI,
    }}>
      <div style={{
        width: "100%", maxWidth: 720, maxHeight: "100%",
        display: "flex", flexDirection: "column",
        background: t.windowBg, color: t.text,
        border: `0.5px solid ${t.hairStrong}`, borderRadius: 14,
        boxShadow: "0 30px 80px rgba(0,0,0,0.45)", overflow: "hidden",
      }}>
        <div style={{
          padding: "14px 18px",
          borderBottom: `0.5px solid ${t.hair}`,
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: status === "error" ? "#FF5F57"
              : status === "done" ? t.success : t.accent,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <IconSparkles size={14} color="white" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>
              {status === "running" && `분석 중 · ${Math.round(progress * 100)}%`}
              {status === "done" && "분석 완료"}
              {status === "error" && "분석 실패"}
            </div>
            <div style={{ fontSize: 11, color: t.textTertiary, marginTop: 2 }}>
              {analyzer.state.stage === "transcribe" ? "whisper 트랜스크립션"
                : analyzer.state.stage === "summarize" ? "Claude CLI 요약"
                : status === "done" ? result?.title || ""
                : ""}
            </div>
          </div>
          <button onClick={status === "running" ? () => analyzer.cancel() : () => analyzer.reset()}
            style={{
              border: `0.5px solid ${t.hair}`,
              background: t.surface, color: t.text,
              padding: "6px 12px", borderRadius: 8, cursor: "pointer",
              fontSize: 12, fontFamily: FONT_UI, fontWeight: 500,
            }}>
            {status === "running" ? "취소" : "닫기"}
          </button>
        </div>

        <div style={{ padding: 18, overflow: "auto", display: "flex", flexDirection: "column", gap: 14 }}>
          {status === "running" && (
            <>
              <ProgressBar value={progress} />
              <CliConsole />
            </>
          )}
          {status === "error" && (
            <div style={{
              padding: 14, borderRadius: 10,
              background: "rgba(255,95,87,0.08)",
              border: "0.5px solid rgba(255,95,87,0.25)",
              color: t.text, fontSize: 12.5, lineHeight: 1.5,
            }}>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>에러</div>
              <div style={{ color: t.textSecondary, whiteSpace: "pre-wrap" }}>{error}</div>
            </div>
          )}
          {status === "done" && result && (
            <ResultPanel result={result} />
          )}
          {(status === "done" || status === "error") && logs.length > 0 && (
            <details style={{ fontSize: 12, color: t.textSecondary }}>
              <summary style={{ cursor: "pointer", marginBottom: 8 }}>CLI 로그 ({logs.length}줄)</summary>
              <CliConsole />
            </details>
          )}
        </div>
      </div>
    </div>
  );
}

function ProgressBar({ value }) {
  const { t } = useTheme();
  return (
    <div style={{
      height: 6, borderRadius: 3, overflow: "hidden",
      background: t.surfaceSunken,
    }}>
      <div style={{
        width: `${Math.round((value || 0) * 100)}%`, height: "100%",
        background: `linear-gradient(90deg, ${t.accent}, #FF9066)`,
        transition: "width 200ms ease",
      }} />
    </div>
  );
}

function ResultPanel({ result }) {
  const { t } = useTheme();
  const sections = legacyToSections?.(result) || result.sections || [];
  const sectionHeader = (title) => (
    <div style={{
      fontSize: 10.5, fontWeight: 700, letterSpacing: "0.04em",
      textTransform: "uppercase", color: t.textTertiary, marginBottom: 8,
    }}>{title}</div>
  );
  const renderBullet = (raw, i) => {
    const text = String(raw).trim();
    const m = text.match(/^([^:：]{1,40})[:：]\s*(.+)$/s);
    const label = m?.[1];
    const body = m?.[2] ?? text;
    return (
      <div key={i} style={{
        padding: "8px 12px", borderRadius: 8,
        background: t.surfaceAlt, border: `0.5px solid ${t.hair}`,
        display: "flex", gap: 10, alignItems: "flex-start",
      }}>
        <div style={{
          marginTop: 6, width: 4, height: 4, borderRadius: "50%",
          background: t.accent, flexShrink: 0,
        }}/>
        <div style={{ fontSize: 12.5, lineHeight: 1.6, color: t.text, minWidth: 0 }}>
          {label && <span style={{ fontWeight: 700 }}>{label}: </span>}
          <span style={{ color: label ? t.textSecondary : t.text }}>{body}</span>
        </div>
      </div>
    );
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {result.title && (
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, letterSpacing: "-0.01em" }}>
          {result.title}
        </h2>
      )}
      {result.tldr && (
        <div>
          {sectionHeader("TL;DR")}
          <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, color: t.text }}>
            {result.tldr}
          </p>
        </div>
      )}
      {result.overview && (
        <div>
          {sectionHeader("요약")}
          <p style={{
            margin: 0, fontSize: 13, lineHeight: 1.7, color: t.text,
            whiteSpace: "pre-wrap",
          }}>{result.overview}</p>
        </div>
      )}
      {sections.map((sec, i) => sec.bullets?.length > 0 && (
        <div key={i}>
          {sectionHeader(sec.heading)}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {sec.bullets.map(renderBullet)}
          </div>
        </div>
      ))}
    </div>
  );
}

Object.assign(window, { AnalyzingOverlay, ProgressBar, ResultPanel });
