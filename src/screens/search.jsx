// Search / tags screen — a quick library filter view

function SearchScreen({ onSelect }) {
  const { t } = useTheme();
  const [q, setQ] = React.useState("");
  const [tag, setTag] = React.useState(null);
  const filtered = RECORDINGS.filter(r => {
    if (tag && !r.tags.includes(tag)) return false;
    if (!q) return true;
    const hay = (r.title + " " + (r.tldr || "") + " " + r.speakers.join(" ") + " " + r.tags.join(" ")).toLowerCase();
    return hay.includes(q.toLowerCase());
  });
  return (
    <div style={{ padding: "20px 24px 28px" }}>
      <h1 style={{ margin: "0 0 14px", fontSize: 22, fontWeight: 700, color: t.text }}>
        검색 & 태그
      </h1>
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        height: 40, padding: "0 14px", borderRadius: 10,
        background: t.surfaceAlt, border: `0.5px solid ${t.hair}`,
      }}>
        <IconSearch size={14} color={t.textSecondary} />
        <input value={q} onChange={e => setQ(e.target.value)}
          placeholder="제목, 요약, 화자, 태그로 검색…"
          style={{
            flex: 1, border: "none", outline: "none", background: "transparent",
            fontSize: 14, color: t.text, fontFamily: FONT_UI,
          }}/>
        <span style={{
          fontSize: 10, color: t.textTertiary,
          padding: "2px 6px", borderRadius: 4,
          background: "rgba(0,0,0,0.05)", fontFamily: FONT_MONO,
        }}>⌘K</span>
      </div>

      <div style={{
        marginTop: 14, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap"
      }}>
        <span style={{
          fontSize: 11, color: t.textTertiary, marginRight: 4,
          textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600
        }}>태그</span>
        {SIDEBAR_TAGS.map(tg => {
          const on = tag === tg.label;
          return (
            <button key={tg.id} onClick={() => setTag(on ? null : tg.label)} style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              padding: "3px 9px", borderRadius: 12,
              background: on ? tg.color + "22" : t.surface,
              border: `0.5px solid ${on ? tg.color + "88" : t.hair}`,
              color: on ? tg.color : t.textSecondary,
              fontSize: 11.5, fontWeight: 500, cursor: "pointer",
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: tg.color }}/>
              {tg.label}
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: 18 }}>
        <div style={{
          fontSize: 11, color: t.textTertiary, marginBottom: 8,
          textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600
        }}>
          결과 {filtered.length}개
        </div>
        <LibraryList items={filtered} onSelect={onSelect} dense />
      </div>
    </div>
  );
}

Object.assign(window, { SearchScreen });
