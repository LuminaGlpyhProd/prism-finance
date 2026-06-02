const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  isElectron: true,
  startSyncHost: (authToken) => ipcRenderer.invoke("sync-start-host", authToken),
  stopSyncHost: () => ipcRenderer.invoke("sync-stop-host"),
  getLanAddresses: () => ipcRenderer.invoke("sync-get-addresses"),
  pushSyncState: (state) => ipcRenderer.send("sync-push-state", state),
  onSyncRemoteState: (callback) => {
    const handler = (_event, payload) => callback(payload);
    ipcRenderer.on("sync-remote-state", handler);
    return () => ipcRenderer.removeListener("sync-remote-state", handler);
  },
  onSyncNeedState: (callback) => {
    const handler = () => callback();
    ipcRenderer.on("sync-need-state", handler);
    return () => ipcRenderer.removeListener("sync-need-state", handler);
  },
  setOpenAtLogin: (enabled) => ipcRenderer.invoke("set-open-at-login", enabled),
  getOpenAtLogin: () => ipcRenderer.invoke("get-open-at-login"),
  checkForUpdates: () => ipcRenderer.invoke("check-for-updates"),
});
