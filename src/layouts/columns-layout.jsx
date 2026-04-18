// Layout 3 — Three columns (Mail/Notes style): sidebar + list + detail

function ColumnsLayout({ state, setState, onThemeToggle, mode }) {
  const { t } = useTheme();
  const { activeNav, selectedId, view } = state;
  const lib = useLibrary();
  const analyzer = useAnalyzer();

  const all = lib?.recordings || [];
  const items = filterByNav(all, activeNav);
  const selected = all.find(r => r.id === selectedId) || items[0] || null;

  // Auto-select the first item once the library loads
  React.useEffect(() => {
    if (!selectedId && items[0]) {
      setState(s => ({ ...s, selectedId: items[0].id }));
    }
  }, [selectedId, items.length]);

  const onDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer?.files || []);
    const audio = files.find(f =>
      /^(audio\/|video\/)/.test(f.type) ||
      /\.(m4a|mp3|wav|aac|flac|ogg|webm|mp4)$/i.test(f.name));
    if (!audio) return;
    const p = (window.recast?.getPathForFile?.(audio)) || audio.path;
    if (p) analyzer?.analyzePath(p);
  };
  const onDragOver = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = "copy"; };

  return (
    <WindowFrame>
      <div
        style={{ display: "flex", flex: 1, minHeight: 0 }}
        onDrop={onDrop} onDragOver={onDragOver}
      >
        <Sidebar activeNav={activeNav} items={all}
          onNav={id => setState(s => ({ ...s, activeNav: id }))} />
        {/* middle list column */}
        <div style={{
          width: 300, flexShrink: 0,
          borderRight: `0.5px solid ${t.hair}`,
          background: t.surfaceAlt,
          display: "flex", flexDirection: "column",
        }}>
          <div style={{
            height: 52, display: "flex", alignItems: "center",
            padding: "0 16px", gap: 8,
            borderBottom: `0.5px solid ${t.hair}`,
            flexShrink: 0, WebkitAppRegion: "drag",
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: t.text }}>
              {navLabel(activeNav)}
            </div>
            <span style={{ fontSize: 11, color: t.textTertiary }}>{items.length}</span>
            <div style={{ flex: 1 }} />
            <div style={{ WebkitAppRegion: "no-drag" }}>
              <IconButton icon={IconPlus} title="파일 추가"
                onClick={() => analyzer?.pickAndAnalyze()} />
            </div>
          </div>
          <div style={{ padding: "6px 0", overflow: "auto", flex: 1 }}>
            {items.length === 0
              ? <EmptyList loaded={lib?.loaded} analyzer={analyzer} />
              : items.map(r => (
                <ColumnListRow key={r.id} rec={r}
                  selected={selectedId === r.id || (!selectedId && r.id === items[0].id)}
                  onClick={() => setState(s => ({ ...s, selectedId: r.id, view: "detail" }))}
                />
              ))}
          </div>
        </div>
        {/* right detail */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          <TitleBar
            title={selected?.title}
            subtitle={
              selected?.status === "analyzing" ? "분석 중"
                : selected ? `${selected.duration} · ${selected.source}` : ""
            }
            right={<>
              <IconButton icon={mode === "dark" ? IconSun : IconMoon} onClick={onThemeToggle}
                title="테마 전환" />
              <IconButton icon={IconDownload} title="Markdown 내보내기"
                onClick={() => selected && lib?.exportMarkdown(selected.id)} />
              <IconButton icon={IconTrash || IconShare} title="삭제"
                onClick={() => {
                  if (!selected) return;
                  if (confirm(`"${selected.title}" 을(를) 삭제할까요?`)) {
                    lib?.remove(selected.id);
                    setState(s => ({ ...s, selectedId: null }));
                  }
                }} />
            </>}
          />
          <div style={{ flex: 1, overflow: "auto" }}>
            {view === "transcript" && selected
              ? <TranscriptFull rec={selected} />
              : selected
                ? <DetailBody rec={selected}
                    onShowAll={() => setState(s => ({ ...s, view: "transcript" }))} />
                : <EmptyDetail />}
          </div>
        </div>
      </div>
    </WindowFrame>
  );
}

function EmptyList({ loaded, analyzer }) {
  const { t } = useTheme();
  return (
    <div style={{
      padding: "32px 20px", textAlign: "center",
      color: t.textTertiary, fontSize: 12.5, lineHeight: 1.6,
    }}>
      {loaded === false ? "불러오는 중..." : (
        <>
          아직 녹음이 없습니다.
          <div style={{ height: 10 }} />
          <button
            onClick={() => analyzer?.pickAndAnalyze()}
            style={{
              padding: "8px 14px", borderRadius: 8, cursor: "pointer",
              background: t.accent, color: "white", border: "none",
              fontSize: 12, fontWeight: 600, fontFamily: FONT_UI,
            }}>
            파일 선택해서 시작하기
          </button>
          <div style={{ height: 10 }} />
          <div style={{ fontSize: 11, color: t.textTertiary }}>
            또는 녹음 파일을 창으로 드래그하세요
          </div>
        </>
      )}
    </div>
  );
}

function EmptyDetail() {
  const { t } = useTheme();
  return (
    <div style={{
      height: "100%", display: "flex", alignItems: "center", justifyContent: "center",
      flexDirection: "column", gap: 8, color: t.textTertiary,
    }}>
      <IconWaveform size={28} color={t.textTertiary} />
      <div style={{ fontSize: 13 }}>녹음을 선택하거나 새 파일을 분석해보세요</div>
    </div>
  );
}

function ColumnListRow({ rec, selected, onClick }) {
  const { t } = useTheme();
  const [hover, setHover] = React.useState(false);
  return (
    <div onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        margin: "2px 8px", padding: "10px 12px", borderRadius: 8,
        background: selected ? t.accent : hover ? t.sidebarItemHover : "transparent",
        cursor: "pointer", transition: "background 80ms",
      }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 6, marginBottom: 4,
      }}>
        {rec.starred && <IconStar size={9} color={selected ? "white" : "#E8A72B"} />}
        <div style={{
          fontSize: 12.5, fontWeight: 600,
          color: selected ? "white" : t.text,
          flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>{rec.title}</div>
        <span style={{
          fontSize: 10, color: selected ? "rgba(255,255,255,0.8)" : t.textTertiary,
        }}>{rec.dateShort}</span>
      </div>
      <div style={{
        fontSize: 11, color: selected ? "rgba(255,255,255,0.85)" : t.textSecondary,
        marginBottom: 5,
        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
        overflow: "hidden",
      }}>
        {rec.status === "analyzing"
          ? `분석 중 · ${Math.round((rec.progress || 0) * 100)}%`
          : (rec.tldr || (rec.speakers || []).join(", ") || "요약 없음")}
      </div>
      <div style={{
        display: "flex", alignItems: "center", gap: 6,
        fontSize: 10, color: selected ? "rgba(255,255,255,0.75)" : t.textTertiary,
      }}>
        <span>{rec.duration}</span>
        <span>·</span>
        <span>{rec.source}</span>
      </div>
    </div>
  );
}

Object.assign(window, { ColumnsLayout, ColumnListRow, EmptyList, EmptyDetail });
