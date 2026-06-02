@echo off
title Prism Finance - Publish to GitHub
cd /d "%~dp0"

echo ============================================
echo  Prism Finance - One-time GitHub setup
echo ============================================
echo.
echo This will:
echo   1. Install GitHub CLI + Node (if missing)
echo   2. Log you into GitHub (browser opens once)
echo   3. Upload the project and build .exe + .apk
echo   4. Open the download page when done
echo.
pause

REM --- Install Node.js (includes npm) ---
where npm >nul 2>&1
if errorlevel 1 (
  echo Installing Node.js...
  winget install OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
  echo Restart this script after Node installs, or open a NEW Command Prompt.
  pause
  exit /b 0
)

REM --- Install GitHub CLI ---
where gh >nul 2>&1
if errorlevel 1 (
  echo Installing GitHub CLI...
  winget install GitHub.cli --accept-package-agreements --accept-source-agreements
  echo Open a NEW Command Prompt and run this script again.
  pause
  exit /b 0
)

REM --- GitHub login (one time) ---
gh auth status >nul 2>&1
if errorlevel 1 (
  echo Log in to GitHub in your browser...
  gh auth login -h github.com -p https -w -s repo,workflow
)

echo.
set /p REPO_NAME="GitHub repo name (default: prism-finance): "
if "%REPO_NAME%"=="" set REPO_NAME=prism-finance

echo.
echo Committing latest files...
git add -A
git commit -m "Update Prism Finance" 2>nul

echo.
echo Creating repo and pushing (public)...
gh repo view %REPO_NAME% >nul 2>&1
if errorlevel 1 (
  gh repo create %REPO_NAME% --public --source=. --remote=origin --push
) else (
  git push -u origin main 2>nul
  git push -u origin master 2>nul
  git push origin HEAD:main
)

for /f "tokens=*" %%i in ('gh api user -q .login') do set GH_USER=%%i
echo.
echo Repo: https://github.com/%GH_USER%/%REPO_NAME%

echo.
echo Starting cloud build (exe + apk)...
gh workflow run build-apps.yml --repo %GH_USER%/%REPO_NAME%

echo Waiting for build (~10-15 minutes)...
:wait_loop
timeout /t 30 /nobreak >nul
for /f "tokens=*" %%s in ('gh run list --repo %GH_USER%/%REPO_NAME% --workflow=build-apps.yml --limit 1 --json status -q ".[0].status"') do set RUN_STATUS=%%s
echo Status: %RUN_STATUS%
if "%RUN_STATUS%"=="completed" goto done
if "%RUN_STATUS%"=="failure" goto failed
goto wait_loop

:done
echo.
echo BUILD SUCCESS! Opening downloads...
start https://github.com/%GH_USER%/%REPO_NAME%/releases/latest
echo.
echo Download:
echo   - Prism-Finance-Windows.exe
echo   - Prism-Finance-Android.apk
pause
exit /b 0

:failed
echo Build failed. Open Actions for logs:
start https://github.com/%GH_USER%/%REPO_NAME%/actions
pause
exit /b 1
