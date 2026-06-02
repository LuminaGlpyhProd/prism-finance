# Why "Build installable apps" is missing on GitHub

GitHub only shows workflows that are **on GitHub**, not only on your PC.

The workflow file must live at:

```
.github/workflows/build-apps.yml
```

If that folder was not uploaded, the Actions tab stays empty.

---

## Fix: push the workflow (pick one method)

### Method 1 — GitHub website (no terminal)

1. Open your repo on **github.com**.
2. Click **Add file** → **Upload files**.
3. Drag the entire **`.github`** folder from:
   `C:\Users\USER'S\Projects\prism-finance\.github`
4. Also upload **`package.json`** if the repo is new or missing it.
5. Click **Commit changes**.
6. Go to **Actions** — you should see **"Build installable apps"** on the left.
7. Click it → **Run workflow** → **Run workflow**.

### Method 2 — GitHub Desktop

1. Install [GitHub Desktop](https://desktop.github.com).
2. **File → Add local repository** → choose `prism-finance`.
3. Commit all files (make sure `.github` is included — enable "Show hidden files" in Windows if needed).
4. **Publish repository** or **Push origin**.
5. Open **Actions** on GitHub.com.

### Method 3 — Enable Actions (if the tab is empty)

1. Repo → **Settings** → **Actions** → **General**.
2. Under "Actions permissions", choose **Allow all actions**.
3. Save.

---

## Download your apps

1. **Actions** → click the latest **Build installable apps** run.
2. Scroll to **Artifacts** at the bottom.
3. Download:
   - **Prism-Finance-Windows-exe** → `.exe` for PC
   - **Prism-Finance-Android-apk** → `.apk` for Android

---

## Still no workflow?

Check on GitHub that this file exists (open it in the browser):

`https://github.com/YOUR_USERNAME/YOUR_REPO/blob/main/.github/workflows/build-apps.yml`

If you get **404**, the workflow was never pushed.

---

## No GitHub? Use the PC builder instead

Double-click **`BUILD-APPS.cmd`** in the project folder (requires Node.js installed once).
