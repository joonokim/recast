// Tweaks panel — floating, bottom-right. Expose layout + theme + color.

function TweaksPanel({ state, setState, visible }) {
  const { t } = useTheme();
  if (!visible) return null;

  return (
    <div style={{
      position: "fixed", right: 18, bottom: 18, zIndex: 1000,
      width: 280, padding: 14, borderRadius: 14,
      background: t.surface,
      border: `0.5px solid ${t.hairStrong}`,
      boxShadow: "0 12px 40px rgba(0,0,0,0.22)",
      fontFamily: FONT_UI, color: t.text,
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 6, marginBottom: 12,
      }}>
        <IconSettings size={13} color={t.textSecondary}/>
        <div style={{ fontSize: 12, fontWeight: 700 }}>Tweaks</div>
      </div>

      <TweakSection label="테마">
        <div style={{ display: "flex", gap: 6 }}>
          {[
            { id: "light", label: "라이트", icon: IconSun },
            { id: "dark", label: "다크", icon: IconMoon },
          ].map(opt => {
            const Ic = opt.icon;
            const on = state.theme === opt.id;
            return (
              <button key={opt.id}
                onClick={() => setState(s => ({ ...s, theme: opt.id }))}
                style={{
                  flex: 1, padding: "8px 10px", borderRadius: 8,
                  background: on ? t.accentSoft : t.surfaceAlt,
                  border: on ? `0.5px solid ${t.accent}` : `0.5px solid ${t.hair}`,
                  cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                  fontSize: 11.5, fontWeight: 500,
                  color: on ? t.accentText : t.text,
                  fontFamily: FONT_UI,
                }}>
                <Ic size={12} color={on ? t.accentText : t.textSecondary}/>
                {opt.label}
              </button>
            );
          })}
        </div>
      </TweakSection>

      <TweakSection label="화면 바로가기">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          {[
            { id: "library", label: "라이브러리" },
            { id: "detail", label: "상세/요약", needsSel: true },
            { id: "transcript", label: "트랜스크립트", needsSel: true },
            { id: "search", label: "검색" },
          ].map(opt => (
            <button key={opt.id}
              onClick={() => setState(s => ({
                ...s,
                view: opt.id,
                selectedId: opt.needsSel && !s.selectedId ? "r1" : s.selectedId,
              }))}
              style={{
                textAlign: "center", padding: "7px 8px", borderRadius: 6,
                background: state.view === opt.id ? t.accent : t.surfaceAlt,
                color: state.view === opt.id ? "white" : t.text,
                border: `0.5px solid ${state.view === opt.id ? t.accent : t.hair}`,
                cursor: "pointer", fontSize: 11, fontWeight: 500,
                fontFamily: FONT_UI,
              }}>
              {opt.label}
            </button>
          ))}
        </div>
      </TweakSection>

      <TweakSection label="분석 중 카드 보기">
        <button
          onClick={() => setState(s => ({ ...s, selectedId: "r2", view: "detail" }))}
          style={{
            width: "100%", padding: "8px 10px", borderRadius: 6,
            background: t.surfaceAlt, border: `0.5px solid ${t.hair}`,
            cursor: "pointer", fontSize: 11.5, fontWeight: 500,
            color: t.text, fontFamily: FONT_UI,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}>
          <IconSparkles size={12} color={t.accent}/>
          김대표님 1:1 · 분석 중 화면 열기
        </button>
      </TweakSection>
    </div>
  );
}

function TweakSection({ label, children }) {
  const { t } = useTheme();
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{
        fontSize: 10, fontWeight: 700, color: t.textTertiary,
        textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6,
      }}>{label}</div>
      {children}
    </div>
  );
}

Object.assign(window, { TweaksPanel });
