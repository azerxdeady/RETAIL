@echo off
title Install Karthik Jewellers Auto-Start Service
echo ====================================================================
echo  INSTALL KARTHIK JEWELLERS AUTO-START ON WINDOWS LOGIN
echo ====================================================================
echo.

powershell -NoProfile -Command "
$startupFolder = [Environment]::GetFolderPath('Startup')
$shortcutPath = Join-Path $startupFolder 'Karthik Jewellers Local Server.lnk'
$targetVbs = 'C:\Users\Star-PC\Documents\Github\RETAIL\start-background.vbs'

$wsh = New-Object -ComObject WScript.Shell
$sc = $wsh.CreateShortcut($shortcutPath)
$sc.TargetPath = 'wscript.exe'
$sc.Arguments = '\"' + $targetVbs + '\"'
$sc.WorkingDirectory = 'C:\Users\Star-PC\Documents\Github\RETAIL'
$sc.Description = 'Karthik Jewellers Local Hosting Server'
$sc.Save()

Write-Host '[SUCCESS] Auto-start configured!' -ForegroundColor Green
Write-Host ('Shortcut created in: ' + $shortcutPath) -ForegroundColor Yellow
Write-Host 'The server will now automatically launch silently in the background whenever this computer boots up.' -ForegroundColor Cyan
"

echo.
pause
