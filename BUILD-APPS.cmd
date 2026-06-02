@echo off
REM Double-click this file to build Windows .exe (requires Node.js installed once)
cd /d "%~dp0"

where node >nul 2>&1
if errorlevel 1 (
  echo Node.js is not installed. Download from https://nodejs.org then run this again.
  pause
  exit /b 1
)

echo Building Prism Finance for Windows...
call npm install
if errorlevel 1 goto fail

call npm run icons
call npm run build:desktop
if errorlevel 1 goto fail

echo.
echo Done! Your app is here:
echo   dist-desktop\Prism Finance *.exe
echo.
explorer dist-desktop
pause
exit /b 0

:fail
echo Build failed.
pause
exit /b 1
