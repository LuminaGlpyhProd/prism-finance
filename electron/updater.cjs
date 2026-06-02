const { autoUpdater } = require("electron-updater");
const { dialog } = require("electron");

function setupAutoUpdater(mainWindow) {
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on("update-downloaded", () => {
    dialog
      .showMessageBox(mainWindow, {
        type: "info",
        title: "Update ready",
        message: "Prism Finance will restart to install the update.",
        buttons: ["Restart now", "Later"],
      })
      .then(({ response }) => {
        if (response === 0) autoUpdater.quitAndInstall();
      });
  });

  autoUpdater.on("error", (err) => {
    console.error("Auto-update error:", err.message);
  });
}

function checkForUpdates() {
  if (process.env.NODE_ENV === "development") return;
  return autoUpdater.checkForUpdatesAndNotify();
}

module.exports = { setupAutoUpdater, checkForUpdates };
