// IPC bridge between the design prototype UI and Electron main process.
// Falls back to a "no-op" shape when window.recast is missing (pure web preview).

const AnalyzerCtx = React.createContext(null);

const IDLE = {
  status: "idle",        // idle | picking | running | done | error
  stage: null,           // transcribe | summarize | null
  progress: 0,
  logs: [],
  result: null,
  error: null,
};

function AnalyzerProvider({ children, onStart, onDone }) {
  const [state, setState] = React.useState(IDLE);
  const stateRef = React.useRef(state);
  stateRef.current = state;

  const bridge = typeof window !== "undefined" ? window.recast : null;

  React.useEffect(() => {
    const sub = bridge?.onAnalyzeEvent || bridge?.onEvent;
    if (!sub) return;
    const off = sub((evt) => {
      setState((s) => {
        switch (evt.type) {
          case "log":
            return { ...s, logs: [...s.logs, { t: evt.t, k: evt.k, s: evt.s, m: evt.m }] };
          case "stage":
            return { ...s, stage: evt.stage };
          case "progress":
            return { ...s, progress: evt.value };
          case "result":
            return { ...s, status: "done", progress: 1, result: evt.data };
          case "error":
            return { ...s, status: "error", error: evt.message };
          default:
            return s;
        }
      });
    });
    return off;
  }, [bridge]);

  React.useEffect(() => {
    if (state.status === "done" && state.result) onDone?.(state.result);
  }, [state.status, state.result]);

  const api = React.useMemo(() => ({
    available: !!bridge,
    state,
    async pickAndAnalyze() {
      if (!bridge) { alert("Electron 내부에서만 실행됩니다. npm start로 실행해주세요."); return; }
      setState({ ...IDLE, status: "picking" });
      const filePath = await bridge.pickAudioFile();
      if (!filePath) { setState(IDLE); return; }
      setState({ ...IDLE, status: "running" });
      onStart?.(filePath);
      bridge.startAnalyze(filePath);
    },
    analyzePath(filePath) {
      if (!bridge || !filePath) return;
      setState({ ...IDLE, status: "running" });
      onStart?.(filePath);
      bridge.startAnalyze(filePath);
    },
    cancel() {
      bridge?.cancelAnalyze?.();
      setState((s) => ({ ...s, status: "idle" }));
    },
    reset() { setState(IDLE); },
  }), [bridge, state, onStart, onDone]);

  return <AnalyzerCtx.Provider value={api}>{children}</AnalyzerCtx.Provider>;
}

function useAnalyzer() { return React.useContext(AnalyzerCtx); }

Object.assign(window, { AnalyzerProvider, useAnalyzer });
