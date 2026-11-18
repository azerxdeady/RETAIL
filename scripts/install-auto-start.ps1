# Install Karthik Jewellers Local Server Auto-Start Shortcut in Windows Startup
Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host "  INSTALL KARTHIK JEWELLERS AUTO-START ON WINDOWS LOGIN              " -ForegroundColor Yellow
Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host ""

try {
    $startupFolder = [Environment]::GetFolderPath('Startup')
    $shortcutPath = Join-Path $startupFolder "Karthik Jewellers Local Server.lnk"
    $projectDir = Split-Path -Parent $PSScriptRoot
    $targetVbs = Join-Path $projectDir "start-background.vbs"

    if (-not (Test-Path $targetVbs)) {
        throw "start-background.vbs not found at: $targetVbs"
    }

    $wsh = New-Object -ComObject WScript.Shell
    $sc = $wsh.CreateShortcut($shortcutPath)
    $sc.TargetPath = "wscript.exe"
    $sc.Arguments = "`"$targetVbs`""
    $sc.WorkingDirectory = $projectDir
    $sc.Description = "Karthik Jewellers Local Hosting Server"
    $sc.Save()

    Write-Host "[SUCCESS] Auto-start configured successfully!" -ForegroundColor Green
    Write-Host "Shortcut created in: $shortcutPath" -ForegroundColor Yellow
    Write-Host "The server will now automatically launch silently in the background whenever Windows starts up." -ForegroundColor Cyan
} catch {
    Write-Host "[ERROR] Failed to configure auto-start: $_" -ForegroundColor Red
}

Write-Host ""
