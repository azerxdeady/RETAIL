@echo off
title Remove Karthik Jewellers Auto-Start Service
echo ====================================================================
echo  REMOVE KARTHIK JEWELLERS AUTO-START ON WINDOWS LOGIN
echo ====================================================================
echo.

powershell -NoProfile -Command "
$startupFolder = [Environment]::GetFolderPath('Startup')
$shortcutPath = Join-Path $startupFolder 'Karthik Jewellers Local Server.lnk'
if (Test-Path $shortcutPath) {
    Remove-Item -Path $shortcutPath -Force
    Write-Host '[SUCCESS] Auto-start shortcut removed from Windows Startup.' -ForegroundColor Green
} else {
    Write-Host 'No auto-start shortcut was found in Windows Startup.' -ForegroundColor Yellow
}
"

echo.
pause
