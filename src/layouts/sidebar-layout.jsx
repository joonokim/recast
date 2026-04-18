// Layout 1 — Sidebar (canonical Apple app: left nav + main content)

function SidebarNavItem({ item, active, onClick }) {
  const { t } = useTheme();
  const [hover, setHover] = React.useState(false);
  const iconMap = {
    waveform: IconWaveform, star: IconStar, clock: IconClock,
    sparkles: IconSparkles, cloud: IconCloud, mic: IconMic,
    airdrop: IconAirDrop,
  };
  const Ic = iconMap[item.icon] || IconWaveform;
  return (
    <div onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "grid", gridTemplateColumns: "18px 1fr auto",
        alignItems: "center", gap: 8,
        height: 26, padding: "0 10px", margin: "0 8px",
        borderRadius: 6, cursor: "pointer",
        background: active ? t.sidebarItemActive : hover ? t.sidebarItemHover : "transparent",
        transition: "background 80ms",
      }}>
      <Ic size={13} color={active ? t.accent : t.textSecondary} />
      <span style={{
        fontSize: 12.5, fontWeight: active ? 600 : 500,
        color: active ? t.text : t.textSecondary,
      }}>{item.label}</span>
      {item.count != null && (
        <span style={{ fontSize: 10.5, color: t.textTertiary, fontVariantNumeric: "tabular-nums" }}>
          {item.count}
        </span>
      )}
    </div>
  );
}

function SidebarSectionHeader({ children }) {
  const { t } = useTheme();
  return (
    <div style={{
      padding: "14px 18px 5px",
      fontSize: 10.5, fontWeight: 700,
      color: t.textTertiary,
      textTransform: "uppercase", letterSpacing: "0.05em",
    }}>{children}</div>
  );
}

function Sidebar({ activeNav, onNav }) {
  const { t } = useTheme();
  const lib = useLibrary?.();
  const all = lib?.recordings;
  const countOf = (predicate) => all ? all.filter(predicate).length : undefined;
  const navItems = all ? [
    { id: "all", label: "모든 녹음", icon: "waveform", count: all.length },
    { id: "starred", label: "즐겨찾기", icon: "star", count: countOf(r => r.starred) },
    { id: "recent", label: "최근", icon: "clock", count: countOf(r => Date.now() - new Date(r.createdAt || 0).getTime() < 7 * 864e5) },
    { id: "analyzing", label: "분석 중", icon: "sparkles", count: countOf(r => r.status === "analyzing") },
  ] : SIDEBAR_NAV;
  const sourceItems = all ? [...new Set(all.map(r => r.source))]
    .filter(Boolean)
    .map(src => ({
      id: `src-${src}`, label: src,
      icon: src === "iCloud" ? "cloud" : src === "Voice Memos" ? "mic" : src === "AirDrop" ? "airdrop" : "cloud",
      count: countOf(r => r.source === src),
    })) : SIDEBAR_SOURCES;
  return (
    <aside style={{
      width: 210, flexShrink: 0,
      background: t.sidebarBg,
      backdropFilter: "blur(40px) saturate(180%)",
      borderRight: `0.5px solid ${t.hair}`,
      display: "flex", flexDirection: "column",
      paddingTop: 52, // room for the traffic lights
    }}>
      <div style={{ padding: "8px 14px 10px", display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{
          width: 22, height: 22, borderRadius: 6,
          background: `linear-gradient(135deg, ${t.accent}, #FF9066)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 1px 2px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.35)",
        }}>
          <IconWaveform size={11} color="white" />
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color: t.text, letterSpacing: "-0.005em" }}>
          Recast
        </div>
      </div>
      <div style={{ overflow: "auto", flex: 1 }}>
        <SidebarSectionHeader>라이브러리</SidebarSectionHeader>
        {navItems.map(n => (
          <SidebarNavItem key={n.id} item={n}
            active={activeNav === n.id} onClick={() => onNav(n.id)} />
        ))}
        {sourceItems.length > 0 && <SidebarSectionHeader>소스</SidebarSectionHeader>}
        {sourceItems.map(n => (
          <SidebarNavItem key={n.id} item={n}
            active={activeNav === n.id} onClick={() => onNav(n.id)} />
        ))}
        <SidebarSectionHeader>태그</SidebarSectionHeader>
        <div style={{ display: "flex", flexDirection: "column", gap: 0, marginBottom: 10 }}>
          {SIDEBAR_TAGS.map(tg => (
            <div key={tg.id} style={{
              display: "flex", alignItems: "center", gap: 8,
              height: 24, padding: "0 10px", margin: "0 8px", borderRadius: 6,
              cursor: "pointer",
            }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: tg.color, marginLeft: 3 }}/>
              <span style={{ fontSize: 12.5, color: t.textSecondary }}>{tg.label}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

function SidebarLayout({ state, setState, onThemeToggle, mode }) {
  const { t } = useTheme();
  const { activeNav, selectedId, view } = state;
  const items = filterByNav(RECORDINGS, activeNav);
  const selected = RECORDINGS.find(r => r.id === selectedId);

  return (
    <WindowFrame>
      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        <Sidebar activeNav={activeNav}
          onNav={id => setState(s => ({ ...s, activeNav: id, view: "library" }))} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <TitleBar
            title={selected && view !== "library"
              ? (view === "transcript" ? `${selected.title} · 트랜스크립트` : selected.title)
              : navLabel(activeNav)}
            center={
              view !== "library" && (
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: 8 }}>
                  <IconButton icon={IconChevron} onClick={() => setState(s => ({ ...s, view: "library" }))} title="뒤로" />
                </div>
              )
            }
            right={<>
              <SearchField width={180} />
              <IconButton icon={mode === "dark" ? IconSun : IconMoon} onClick={onThemeToggle}
                title="테마 전환" />
              <IconButton icon={IconShare} title="공유" />
              <div style={{ width: 6 }} />
              <Button variant="primary" size="sm" icon={IconPlus}>가져오기</Button>
            </>}
          />
          <div style={{ flex: 1, overflow: "auto", background: t.windowBg }}>
            {view === "library" && (
              <>
                <LibraryHeader title={navLabel(activeNav)} count={items.length}
                  rightExtra={<div style={{ display: "flex", gap: 6 }}>
                    <Button size="sm" variant="ghost">최신순 ▾</Button>
                  </div>}
                />
                <ImportDropzone />
                <LibraryList items={items} selectedId={selectedId}
                  onSelect={id => setState(s => ({ ...s, selectedId: id, view: "detail" }))}
                />
              </>
            )}
            {view === "detail" && selected && (
              <DetailBody rec={selected}
                onShowAll={() => setState(s => ({ ...s, view: "transcript" }))}
              />
            )}
            {view === "transcript" && selected && (
              <TranscriptFull rec={selected} />
            )}
            {view === "search" && (
              <SearchScreen onSelect={id => setState(s => ({ ...s, selectedId: id, view: "detail" }))} />
            )}
          </div>
        </div>
      </div>
    </WindowFrame>
  );
}

function navLabel(id) {
  if (typeof id === "string" && id.startsWith("src-")) return id.slice(4);
  const labels = {
    all: "모든 녹음", starred: "즐겨찾기", recent: "최근", analyzing: "분석 중",
  };
  if (labels[id]) return labels[id];
  const mock = [...SIDEBAR_NAV, ...SIDEBAR_SOURCES];
  return mock.find(n => n.id === id)?.label || "모든 녹음";
}
function filterByNav(items, nav) {
  if (nav === "starred") return items.filter(r => r.starred);
  if (nav === "analyzing") return items.filter(r => r.status === "analyzing");
  if (nav === "recent") {
    const cutoff = Date.now() - 7 * 864e5;
    return items.filter(r => new Date(r.createdAt || 0).getTime() > cutoff);
  }
  if (nav === "icloud") return items.filter(r => r.source === "iCloud");
  if (nav === "voicememos") return items.filter(r => r.source === "Voice Memos");
  if (nav === "airdrop") return items.filter(r => r.source === "AirDrop");
  if (typeof nav === "string" && nav.startsWith("src-")) {
    const src = nav.slice(4);
    return items.filter(r => r.source === src);
  }
  return items;
}

Object.assign(window, { Sidebar, SidebarLayout, navLabel, filterByNav });
