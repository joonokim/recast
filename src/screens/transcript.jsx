// Full transcript view with speakers, timestamps, and a search bar

function TranscriptFull({ rec, onJump }) {
  const { t } = useTheme();
  const [filter, setFilter] = React.useState("");
  const items = rec.transcript.filter(s =>
    !filter || s.text.toLowerCase().includes(filter.toLowerCase())
  );
  const speakerColor = (who) => {
    if (who === "나") return t.accent;
    const colors = ["#0A84FF", "#22A06B", "#BF5AF2", "#FF9F0A"];
    const hash = who.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };
  return (
    <div style={{ padding: "18px 24px 28px" }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 10, marginBottom: 14,
      }}>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: t.text }}>
          트랜스크립트
        </h2>
        <span style={{ fontSize: 11.5, color: t.textTertiary }}>
          {rec.transcript.length}개 세그먼트
        </span>
        <div style={{ flex: 1 }} />
        <SearchField placeholder="트랜스크립트 검색" value={filter} onChange={setFilter} width={200} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {items.map((s, i) => (
          <div key={i} onClick={() => onJump?.(s.t)} style={{
            display: "grid", gridTemplateColumns: "58px 1fr",
            gap: 14, padding: "10px 10px", borderRadius: 6,
            cursor: "pointer", transition: "background 80ms ease",
          }}
            onMouseEnter={e => e.currentTarget.style.background = t.sidebarItemHover}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <div style={{
              fontFamily: FONT_MONO, fontSize: 10.5, color: t.textTertiary,
              paddingTop: 4,
            }}>{s.t}</div>
            <div>
              {s.who && (
                <div style={{
                  display: "flex", alignItems: "center", gap: 6, marginBottom: 3,
                }}>
                  <span style={{
                    width: 7, height: 7, borderRadius: "50%",
                    background: speakerColor(s.who),
                  }}/>
                  <span style={{
                    fontSize: 12, fontWeight: 600, color: speakerColor(s.who),
                  }}>{s.who}</span>
                </div>
              )}
              <div style={{ fontSize: 13.5, lineHeight: 1.6, color: t.text }}>
                {s.text}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { TranscriptFull });
