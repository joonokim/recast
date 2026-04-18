// Layout 4 — Focus mode (Granola-style): no sidebar; minimal chrome; single recording centered.
// Click a recording -> goes to that recording. Header strip at top for switching.

function FocusLayout({ state, setState, onThemeToggle, mode }) {
  const { t } = useTheme();
  const { selectedId, view } = state;
  const selected = RECORDINGS.find(r => r.id === selectedId) || RECORDINGS[0];

  return (
    <WindowFrame>
      <TitleBar
        left={
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 6 }}>
            <div style={{
              width: 22, height: 22, borderRadius: 6,
              background: `linear-gradient(135deg, ${t.accent}, #FF9066)`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <IconWaveform size={11} color="white" />
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: t.text }}>Recast</div>
          </div>
        }
        center={
          <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "4px 14px", borderRadius: 14,
              background: t.surfaceSunken, border: `0.5px solid ${t.hair}`,
              fontSize: 12, color: t.textSecondary, fontWeight: 500,
              cursor: "pointer",
            }}
              onClick={() => setState(s => ({ ...s, view: "library" }))}
            >
              <IconWaveform size={11} color={t.textSecondary} />
              모든 녹음
              <span style={{ color: t.textTertiary }}>· {RECORDINGS.length}</span>
              <IconChevron size={10} color={t.textTertiary} />
            </div>
          </div>
        }
        right={<>
          <IconButton icon={IconSearch} />
          <IconButton icon={mode === "dark" ? IconSun : IconMoon} onClick={onThemeToggle} />
          <Button size="sm" variant="primary" icon={IconPlus}>가져오기</Button>
        </>}
      />
      <div style={{ flex: 1, overflow: "auto", background: t.windowBg }}>
        {view === "library" ? (
          <FocusLibrary onSelect={id => setState(s => ({ ...s, selectedId: id, view: "detail" }))}/>
        ) : (
          <div style={{
            maxWidth: 720, margin: "0 auto", padding: "12px 0 40px"
          }}>
            <FocusSwitcher
              current={selected}
              onPrev={() => {
                const i = RECORDINGS.findIndex(r => r.id === selected.id);
                const prev = RECORDINGS[(i - 1 + RECORDINGS.length) % RECORDINGS.length];
                setState(s => ({ ...s, selectedId: prev.id }));
              }}
              onNext={() => {
                const i = RECORDINGS.findIndex(r => r.id === selected.id);
                const next = RECORDINGS[(i + 1) % RECORDINGS.length];
                setState(s => ({ ...s, selectedId: next.id }));
              }}
            />
            <DetailBody rec={selected} />
          </div>
        )}
      </div>
    </WindowFrame>
  );
}

function FocusSwitcher({ current, onPrev, onNext }) {
  const { t } = useTheme();
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "8px 24px",
    }}>
      <button onClick={onPrev} style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        background: "transparent", border: "none", cursor: "pointer",
        fontSize: 11.5, color: t.textTertiary, fontWeight: 500,
      }}>
        <IconChevron size={11} color={t.textTertiary}
          style={{ transform: "rotate(180deg)" }} />
        이전 녹음
      </button>
      <button onClick={onNext} style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        background: "transparent", border: "none", cursor: "pointer",
        fontSize: 11.5, color: t.textTertiary, fontWeight: 500,
      }}>
        다음 녹음
        <IconChevron size={11} color={t.textTertiary} />
      </button>
    </div>
  );
}

function FocusLibrary({ onSelect }) {
  const { t } = useTheme();
  return (
    <div style={{ maxWidth: 780, margin: "0 auto", padding: "28px 24px 40px" }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{
          fontSize: 11, fontWeight: 700, color: t.textTertiary,
          textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8,
        }}>지난 7일</div>
        <h1 style={{
          margin: 0, fontSize: 28, fontWeight: 700, color: t.text,
          letterSpacing: "-0.018em",
        }}>녹음 {RECORDINGS.length}개 · 총 3시간 42분</h1>
      </div>
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10,
      }}>
        {RECORDINGS.map(rec => (
          <FocusCard key={rec.id} rec={rec} onClick={() => onSelect(rec.id)} />
        ))}
      </div>
    </div>
  );
}

function FocusCard({ rec, onClick }) {
  const { t } = useTheme();
  const [hover, setHover] = React.useState(false);
  return (
    <div onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        padding: "16px 18px", borderRadius: 12,
        background: t.surface,
        border: `0.5px solid ${hover ? t.hairStrong : t.hair}`,
        boxShadow: hover ? "0 4px 16px rgba(0,0,0,0.06)" : "0 1px 2px rgba(0,0,0,0.02)",
        cursor: "pointer", transition: "all 120ms",
      }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 6, marginBottom: 8,
        fontSize: 11, color: t.textTertiary,
      }}>
        <IconCloud size={10} color={t.textTertiary}/>
        {rec.source} · {rec.dateShort} · {rec.duration}
        {rec.starred && <IconStar size={10} color="#E8A72B"/>}
      </div>
      <div style={{
        fontSize: 14, fontWeight: 600, color: t.text, marginBottom: 6,
        letterSpacing: "-0.003em",
      }}>{rec.title}</div>
      <div style={{
        fontSize: 12, lineHeight: 1.5, color: t.textSecondary,
        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
        overflow: "hidden", minHeight: 36,
      }}>
        {rec.status === "analyzing"
          ? <span style={{ color: t.accent }}>분석 중 · {Math.round(rec.progress * 100)}%</span>
          : (rec.tldr || "요약 없음")}
      </div>
      <div style={{ marginTop: 10 }}>
        <Waveform width={240} height={16} bars={48} />
      </div>
    </div>
  );
}

Object.assign(window, { FocusLayout, FocusSwitcher, FocusLibrary, FocusCard });
