@echo off
REM Fixes 404 workflow + pushes build fix, then starts GitHub build
cd /d "%~dp0"

set GH=C:\Program Files\GitHub CLI\gh.exe
if not exist "%GH%" set GH=gh

"%GH%" auth status >nul 2>&1
if errorlevel 1 (
  echo Please log in first:
  "%GH%" auth login -h github.com -p https -w
  pause
  exit /b 1
)

echo Committing build fixes...
git add -A
git commit -m "Fix CI build: remove invalid assetPrefix, system fonts"

echo Pushing to GitHub...
git push origin main
if errorlevel 1 (
  echo Trying force push - local has full app, remote may differ...
  git push origin main --force
)

echo Uploading workflow file if missing...
"%GH%" workflow list --repo LuminaGlpyhProd/prism-finance 2>nul | findstr build-apps >nul
if errorlevel 1 (
  echo Workflow missing - open GitHub and upload .github folder
)

echo Starting build...
"%GH%" workflow run build-apps.yml --repo LuminaGlpyhProd/prism-finance

echo.
echo Build started! Watch here:
start https://github.com/LuminaGlpyhProd/prism-finance/actions
echo.
echo When green (~10 min), downloads appear here:
start https://github.com/LuminaGlpyhProd/prism-finance/releases/latest
pause
