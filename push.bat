@echo off
chcp 65001 >nul
cd /d "%~dp0"
set "MSG=%~1"
if "%MSG%"=="" set "MSG=update: %DATE% %TIME%"
echo === Dang day code len GitHub ===
git add -A
git commit -m "%MSG%"
git push origin main
echo === Hoan tat ===
pause
