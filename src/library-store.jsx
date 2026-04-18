// Persistent recordings store bridged to main process.
// window.recast APIs: listRecordings, deleteRecording, toggleStar,
// exportMarkdown, onLibraryChanged.

const LibraryCtx = React.createContext(null);

function LibraryProvider({ children }) {
  const bridge = typeof window !== "undefined" ? window.recast : null;
  const [recordings, setRecordings] = React.useState(() =>
    bridge?.listRecordings ? [] : (window.RECORDINGS || [])
  );
  const [loaded, setLoaded] = React.useState(!bridge?.listRecordings);

  const refresh = React.useCallback(async () => {
    if (!bridge?.listRecordings) { setLoaded(true); return; }
    const list = await bridge.listRecordings();
    setRecordings(Array.isArray(list) ? list : []);
    setLoaded(true);
  }, [bridge]);

  React.useEffect(() => { refresh(); }, [refresh]);
  React.useEffect(() => {
    if (!bridge?.onLibraryChanged) return;
    return bridge.onLibraryChanged(() => refresh());
  }, [bridge, refresh]);

  const api = React.useMemo(() => ({
    available: !!bridge,
    recordings,
    loaded,
    refresh,
    get: (id) => recordings.find(r => r.id === id) || null,
    async remove(id) {
      if (!bridge) return;
      await bridge.deleteRecording(id);
    },
    async toggleStar(id) {
      if (!bridge) return;
      await bridge.toggleStar(id);
    },
    async exportMarkdown(id) {
      if (!bridge) return { ok: false };
      return bridge.exportMarkdown(id);
    },
  }), [bridge, recordings, loaded, refresh]);

  return <LibraryCtx.Provider value={api}>{children}</LibraryCtx.Provider>;
}

function useLibrary() { return React.useContext(LibraryCtx); }

Object.assign(window, { LibraryProvider, useLibrary });
