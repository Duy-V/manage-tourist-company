param([string]$Message = "")
$ErrorActionPreference = "Continue"
Set-Location -Path $PSScriptRoot
if ([string]::IsNullOrWhiteSpace($Message)) {
  $Message = "feat: nut doc noi dung canh diem (TTS) tren the " + (Get-Date -Format "yyyy-MM-dd HH:mm")
}
Write-Host "=== Dang day code len GitHub (nhanh main) ===" -ForegroundColor Cyan
git add -A
git commit -m $Message
git push origin main
Write-Host "=== Hoan tat ===" -ForegroundColor Green
