// Main app — state, layout switcher, theme provider, tweaks wiring

const LAYOUTS = ["sidebar", "tabs", "columns", "focus"];

const DEFAULTS = /*EDITMODE-BEGIN*/{
  "layout": "sidebar",
  "theme": "light",
  "showLayoutLabels": true
}/*EDITMODE-END*/;

function App() {
  const [state, setState] = React.useState(() => {
    const saved = (()=>{ try { return JSON.parse(localStorage.getItem("recast_state") || "{}"); } catch { return {}; }})();
    return {
      layout: "columns",
      theme: saved.theme || DEFAULTS.theme,
      activeNav: "all",
      activeTab: "library",
      view: "library", // library | detail | transcript | search
      selectedId: null,
    };
  });
  const [tweaksOpen, setTweaksOpen] = React.useState(false);

  // persist
  React.useEffect(() => {
    localStorage.setItem("recast_state", JSON.stringify({
      layout: state.layout, theme: state.theme,
    }));
    document.body.classList.toggle("dark-desktop", state.theme === "dark");
  }, [state.layout, state.theme]);

  // Tweaks host integration
  React.useEffect(() => {
    const onMsg = (e) => {
      if (e.data?.type === "__activate_edit_mode") setTweaksOpen(true);
      if (e.data?.type === "__deactivate_edit_mode") setTweaksOpen(false);
    };
    window.addEventListener("message", onMsg);
    window.parent.postMessage({ type: "__edit_mode_available" }, "*");
    return () => window.removeEventListener("message", onMsg);
  }, []);

  React.useEffect(() => {
    window.parent.postMessage({
      type: "__edit_mode_set_keys",
      edits: { layout: state.layout, theme: state.theme }
    }, "*");
  }, [state.layout, state.theme]);

  const onThemeToggle = () => setState(s => ({ ...s, theme: s.theme === "dark" ? "light" : "dark" }));

  const LayoutComponent = {
    sidebar: SidebarLayout, tabs: TabsLayout,
    columns: ColumnsLayout, focus: FocusLayout,
  }[state.layout];

  const inElectron = typeof window !== "undefined" && !!window.recast;

  const handleAnalyzeDone = React.useCallback((result) => {
    setState(s => ({ ...s, selectedId: result.id, view: "detail" }));
  }, []);

  return (
    <ThemeProvider mode={state.theme}>
      <LibraryProvider>
        <AnalyzerProvider onDone={handleAnalyzeDone}>
          <div style={{
            position: "fixed", inset: 0,
            display: "flex", alignItems: "stretch", justifyContent: "stretch",
            padding: inElectron ? 0 : 28, boxSizing: "border-box",
          }}>
            <div style={{
              width: "100%", height: "100%",
              maxWidth: inElectron ? "none" : 1280,
              maxHeight: inElectron ? "none" : 820,
              margin: inElectron ? 0 : "auto",
              display: "flex", flexDirection: "column",
            }}>
              <LayoutComponent state={state} setState={setState}
                onThemeToggle={onThemeToggle} mode={state.theme} />
            </div>
          </div>
          <TweaksPanel state={state} setState={setState} visible={tweaksOpen} />
          <AnalyzingOverlay />
        </AnalyzerProvider>
      </LibraryProvider>
    </ThemeProvider>
  );
}

// Small pill to switch layouts quickly even when tweaks is off.
function LayoutBadge({ state, setState }) {
  const { t } = useTheme();
  const labels = { sidebar: "사이드바", tabs: "탭", columns: "3칼럼", focus: "포커스" };
  return (
    <div style={{
      position: "fixed", left: 18, bottom: 18, zIndex: 100,
      display: "flex", alignItems: "center", gap: 4, padding: 3,
      borderRadius: 14,
      background: t.surface,
      border: `0.5px solid ${t.hairStrong}`,
      boxShadow: "0 6px 20px rgba(0,0,0,0.12)",
      fontFamily: FONT_UI,
    }}>
      {LAYOUTS.map(l => (
        <button key={l}
          onClick={() => setState(s => ({ ...s, layout: l }))}
          style={{
            padding: "5px 10px", borderRadius: 11, border: "none", cursor: "pointer",
            background: state.layout === l ? t.accent : "transparent",
            color: state.layout === l ? "white" : t.textSecondary,
            fontSize: 11, fontWeight: 600, fontFamily: FONT_UI,
          }}>{labels[l]}</button>
      ))}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
