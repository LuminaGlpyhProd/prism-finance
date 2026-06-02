const { app, BrowserWindow, shell, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const {
  startSyncServer,
  stopSyncServer,
  pushHostState,
  getLanAddresses,
} = require("./sync-server.cjs");
const { setupAutoUpdater, checkForUpdates } = require("./updater.cjs");

const isDev = !app.isPackaged;
let mainWindow = null;

function settingsPath() {
  return path.join(app.getPath("userData"), "prism-launcher-settings.json");
}

function readLauncherSettings() {
  try {
    return JSON.parse(fs.readFileSync(settingsPath(), "utf8"));
  } catch {
    return { startAtLogin: true, autoUpdate: true };
  }
}

function applyLoginItem(enabled) {
  app.setLoginItemSettings({
    openAtLogin: !!enabled,
    openAsHidden: false,
    path: process.execPath,
    args: [],
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 360,
    minHeight: 640,
    title: "Prism Finance",
    backgroundColor: "#05060a",
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      preload: path.join(__dirname, "preload.cjs"),
    },
  });

  mainWindow = win;

  win.once("ready-to-show", () => win.show());

  if (isDev) {
    win.loadURL("http://localhost:3000");
  } else {
    const indexHtml = path.join(__dirname, "..", "out", "index.html");
    win.loadFile(indexHtml);
  }

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  return win;
}

ipcMain.handle("sync-start-host", (_event, authToken) => {
  return startSyncServer(authToken, {
    onStateFromClient: (payload) => {
      mainWindow?.webContents.send("sync-remote-state", payload);
    },
    onNeedHostState: () => {
      mainWindow?.webContents.send("sync-need-state");
    },
  });
});

ipcMain.handle("sync-stop-host", () => {
  stopSyncServer();
  return true;
});

ipcMain.handle("sync-get-addresses", () => getLanAddresses());

ipcMain.on("sync-push-state", (_event, state) => {
  pushHostState(state);
});

ipcMain.handle("set-open-at-login", (_event, enabled) => {
  const settings = readLauncherSettings();
  settings.startAtLogin = enabled;
  fs.writeFileSync(settingsPath(), JSON.stringify(settings));
  applyLoginItem(enabled);
  return true;
});

ipcMain.handle("get-open-at-login", () => readLauncherSettings().startAtLogin);

ipcMain.handle("check-for-updates", () => {
  if (readLauncherSettings().autoUpdate !== false) {
    return checkForUpdates();
  }
  return null;
});

app.whenReady().then(() => {
  const launcher = readLauncherSettings();
  applyLoginItem(launcher.startAtLogin !== false);

  createWindow();
  if (!isDev && launcher.autoUpdate !== false) {
    setupAutoUpdater(mainWindow);
    setTimeout(() => checkForUpdates(), 8000);
  }

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  stopSyncServer();
  if (process.platform !== "darwin") app.quit();
});
