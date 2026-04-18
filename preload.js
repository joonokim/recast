const { contextBridge, ipcRenderer, webUtils } = require("electron");

contextBridge.exposeInMainWorld("recast", {
  getPathForFile: (file) => {
    try { return webUtils.getPathForFile(file); }
    catch { return file?.path || null; }
  },
  // analyze pipeline
  pickAudioFile: () => ipcRenderer.invoke("dialog:pickAudio"),
  startAnalyze: (filePath) => ipcRenderer.invoke("analyze:start", filePath),
  cancelAnalyze: () => ipcRenderer.invoke("analyze:cancel"),
  onAnalyzeEvent: (cb) => {
    const h = (_e, evt) => cb(evt);
    ipcRenderer.on("analyze:event", h);
    return () => ipcRenderer.removeListener("analyze:event", h);
  },
  // library store
  listRecordings: () => ipcRenderer.invoke("recordings:list"),
  getRecording: (id) => ipcRenderer.invoke("recordings:get", id),
  deleteRecording: (id) => ipcRenderer.invoke("recordings:delete", id),
  toggleStar: (id) => ipcRenderer.invoke("recordings:toggleStar", id),
  exportMarkdown: (id) => ipcRenderer.invoke("recordings:exportMarkdown", id),
  onLibraryChanged: (cb) => {
    const h = () => cb();
    ipcRenderer.on("library:changed", h);
    return () => ipcRenderer.removeListener("library:changed", h);
  },
  // back-compat shim
  onEvent: (cb) => {
    const h = (_e, evt) => cb(evt);
    ipcRenderer.on("analyze:event", h);
    return () => ipcRenderer.removeListener("analyze:event", h);
  },
});
