# Wi‑Fi sync, auto-start & updates (v0.2)

## Phone Link–style behavior

| Feature | PC (.exe) | Phone (.apk) |
|---------|-----------|--------------|
| Auto-sync on open | Yes (hosts sync on same Wi‑Fi) | Yes (finds PC or uses saved IP) |
| Same Wi‑Fi only | Yes | Yes — mobile data = no sync |
| Password | Default setup uses your personal password | Must match PC |
| Start at startup | **Start when Windows starts** (on by default) | **Open after phone restart** (on by default; see below) |
| Auto-update | Checks GitHub Releases on launch | Banner when a newer APK is released |

## One-time setup

### PC

1. Install latest **Prism-Finance-Windows.exe** from [Releases](https://github.com/LuminaGlpyhProd/prism-finance/releases/latest).
2. **Settings → Wi‑Fi sync** → enable → **This device is PC (host)** → **Use my default**.
3. Leave **Start when Windows starts** enabled.

### Phone

1. Install latest **Prism-Finance-Android.apk**.
2. Same Wi‑Fi as PC.
3. **Settings → Wi‑Fi sync** → **This device is phone** → **Use my default**.
4. Optional: enter PC IP if auto-find fails (shown on PC settings).
5. On Xiaomi/Samsung etc., allow **Autostart** for Prism in phone settings if boot launch does not work.

## Auto-update

- **Windows:** Installer build checks GitHub for a newer version and prompts to restart.
- **Android:** Open app → if an update exists, tap **Download update** (install the new APK).

Publish a new release on GitHub to ship updates to both devices.

## Not cloud / not Google Drive

Data syncs only on your **home Wi‑Fi** between your devices. Nothing is uploaded to Google Drive.
