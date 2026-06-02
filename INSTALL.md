# Install Prism Finance (no PowerShell)

You can use Prism Finance as a **real app** on your phone and PC — not a dev server.

## Option A — Download ready-made files (recommended)

1. Put this project on **GitHub** (create a repo and push the folder).
2. Open the repo on GitHub → **Actions** → **Build installable apps** → **Run workflow**.
3. When it finishes (~5–10 min), open the run → **Artifacts**:
   - **Prism-Finance-Windows** → `.exe` (double-click to run)
   - **Prism-Finance-Android** → `app-debug.apk`

### Android phone

1. Download `app-debug.apk` to your phone.
2. Allow **Install unknown apps** for your browser or Files app.
3. Open the APK and install.
4. Open **Prism Finance** from your home screen.

### Windows PC

1. Download the `.exe` from the artifact (portable installer).
2. Double-click — no PowerShell, no `npm run dev`.

---

## Option B — Build on your PC (one double-click)

1. Install **Node.js** once from [https://nodejs.org](https://nodejs.org) (LTS).
2. Double-click **`BUILD-APPS.cmd`** in the project folder (uses Command Prompt, not PowerShell).
3. When done, open the `dist-desktop` folder and run the **Prism Finance** `.exe`.

---

## Option C — Install like an app from the browser (PWA)

If the site is hosted online (or you open the built `out/index.html` via a local server):

- **Android Chrome**: menu → **Install app** / **Add to Home screen**
- **iPhone Safari**: Share → **Add to Home Screen**

Works offline after the first load. Data stays on your device.

---

## What each package is

| Platform | File | How it runs |
|----------|------|-------------|
| Windows | `.exe` | Electron desktop app |
| Android | `.apk` | Native shell + your UI |
| Mobile browser | PWA | Home screen shortcut |

All versions use the same UI and save data **on your device** (local storage).

---

## iPhone (.ipa)

Apple requires a Mac and a paid developer account to install outside the App Store. Easiest on iPhone: **Option C (PWA)** from Safari.

---

## Troubleshooting

- **Windows SmartScreen**: Click “More info” → “Run anyway” (unsigned dev build).
- **Android blocked**: Enable installs from unknown sources for your file manager.
- **Blank screen on desktop**: Rebuild with `BUILD-APPS.cmd` so assets use relative paths.
