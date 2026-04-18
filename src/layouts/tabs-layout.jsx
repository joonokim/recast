// Layout 2 — Tabs. Top-level tabs (Library, Analyzing, Search), single-pane flow.

function TabBar({ tabs, active, onTab, right }) {
  const { t } = useTheme();
  return (
    <div style={{
      height: 44, display: "flex", alignItems: "center",
      padding: "0 16px", gap: 2,
      borderBottom: `0.5px solid ${t.hair}`,
      background: t.surfaceAlt,
      flexShrink: 0,
    }}>
      {tabs.map(tab => {
        const on = active === tab.id;
        const Ic = tab.icon;
        return (
          <button key={tab.id} onClick={() => onTab(tab.id)} style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "6px 12px", borderRadius: 6,
            background: on ? t.surface : "transparent",
            border: "none", cursor: "pointer",
            color: on ? t.text : t.textSecondary,
            boxShadow: on ? `0 0 0 0.5px ${t.hair}, 0 1px 1px rgba(0,0,0,0.04)` : "none",
            fontSize: 12, fontWeight: 500,
          }}>
            <Ic size={13} color={on ? t.accent : t.textSecondary}/>
            {tab.label}
            {tab.count != null && (
              <span style={{
                fontSize: 10, color: t.textTertiary,
                padding: "0px 5px", borderRadius: 4,
                background: t.surfaceSunken,
              }}>{tab.count}</span>
            )}
          </button>
        );
      })}
      <div style={{ flex: 1 }}/>
      {right}
    </div>
  );
}

function TabsLayout({ state, setState, onThemeToggle, mode }) {
  const { t } = useTheme();
  const { activeTab, selectedId, view } = state;
  const selected = RECORDINGS.find(r => r.id === selectedId);
  const tabs = [
    { id: "library", label: "라이브러리", icon: IconWaveform, count: 7 },
    { id: "analyzing", label: "분석 중", icon: IconSparkles, count: 1 },
    { id: "search", label: "검색 & 태그", icon: IconSearch },
  ];
  const showDetail = view === "detail" && selected;

  return (
    <WindowFrame>
      <TitleBar
        title="Recast"
        subtitle="녹음 분석 · 연결됨"
        left={
          <div style={{
            width: 22, height: 22, borderRadius: 6, marginLeft: 6,
            background: `linear-gradient(135deg, ${t.accent}, #FF9066)`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <IconWaveform size={11} color="white"/>
          </div>
        }
        right={<>
          <IconButton icon={mode === "dark" ? IconSun : IconMoon} onClick={onThemeToggle} />
          <IconButton icon={IconSearch} />
          <Button variant="primary" size="sm" icon={IconPlus}>가져오기</Button>
        </>}
      />
      <TabBar
        tabs={tabs}
        active={showDetail ? "detail" : activeTab}
        onTab={id => setState(s => ({ ...s, activeTab: id, view: id, selectedId: null }))}
        right={showDetail && (
          <Button size="sm" variant="ghost" icon={IconChevron}
            onClick={() => setState(s => ({ ...s, view: "library", activeTab: "library", selectedId: null }))}>
            라이브러리로
          </Button>
        )}
      />
      <div style={{ flex: 1, overflow: "auto", background: t.windowBg }}>
        {activeTab === "library" && view !== "detail" && (
          <>
            <LibraryHeader title="모든 녹음" count={RECORDINGS.length}/>
            <ImportDropzone/>
            <LibraryList items={RECORDINGS}
              onSelect={id => setState(s => ({ ...s, selectedId: id, view: "detail" }))}
            />
          </>
        )}
        {activeTab === "analyzing" && view !== "detail" && (
          <AnalyzingTabPage />
        )}
        {activeTab === "search" && view !== "detail" && (
          <SearchScreen onSelect={id => setState(s => ({ ...s, selectedId: id, view: "detail" }))}/>
        )}
        {showDetail && (
          <DetailBody rec={selected}/>
        )}
      </div>
    </WindowFrame>
  );
}

function AnalyzingTabPage() {
  const { t } = useTheme();
  const analyzing = RECORDINGS.filter(r => r.status === "analyzing");
  return (
    <div style={{ padding: "20px 24px" }}>
      <h1 style={{ margin: "0 0 16px", fontSize: 22, fontWeight: 700, color: t.text }}>
        분석 중인 녹음
      </h1>
      {analyzing.map(rec => (
        <div key={rec.id} style={{
          padding: "18px 20px", borderRadius: 12,
          background: t.surface, border: `0.5px solid ${t.hair}`,
          marginBottom: 14,
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 14, marginBottom: 14,
          }}>
            <ProgressRing size={52} stroke={4} value={rec.progress} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: t.text, marginBottom: 2 }}>
                {rec.title}
              </div>
              <div style={{ fontSize: 11.5, color: t.textTertiary }}>
                {rec.source} · {rec.duration} · {rec.size}
              </div>
            </div>
            <div style={{
              fontSize: 12, color: t.accent, fontWeight: 600,
              fontVariantNumeric: "tabular-nums",
            }}>
              {Math.round(rec.progress * 100)}%
            </div>
          </div>
          <CliConsole compact/>
        </div>
      ))}
      <div style={{
        padding: "20px 22px", borderRadius: 12,
        background: t.surfaceAlt, border: `0.5px dashed ${t.hairStrong}`,
        textAlign: "center",
      }}>
        <div style={{ fontSize: 12, color: t.textSecondary }}>
          분석이 끝나면 자동으로 라이브러리로 이동합니다.
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { TabsLayout, AnalyzingTabPage });
