@echo off
setlocal

title ZEDERE Airtable Professional Shell Patch

echo ====================================================
echo  ZEDERE Airtable Professional Shell Patch
echo ====================================================
echo.
echo Keeps Shell / Header / Sidebar / Login / Logout / Theme / Permission / Profile.
echo Improves Airtable Data page with modal Create/Edit/Delete.
echo.

if not exist angular.json (
  echo [ERROR] angular.json not found.
  echo Please copy BAT, PS1, and JSON to your Angular project root.
  pause
  exit /b 1
)

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0apply-zedere-airtable-pro-shell.ps1"

echo.
echo Done.
pause
