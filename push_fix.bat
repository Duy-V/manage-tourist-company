@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo === Xoa file khoa cu (neu co) ===
if exist ".git\index.lock" del /f /q ".git\index.lock"
echo === Dang day code len GitHub ===
git add -A
git commit -m "feat: doi thuong hieu thanh GHIEN DI + them logo"
git push origin main
echo === Hoan tat ===
pause
