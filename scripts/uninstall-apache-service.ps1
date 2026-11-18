# Uninstall Apache Windows Service
Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host "  UNINSTALL APACHE WINDOWS SERVICE                                  " -ForegroundColor Yellow
Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host ""

$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "[INFO] Administrator rights required to uninstall Windows Service." -ForegroundColor Yellow
    Write-Host "[INFO] Prompting for UAC Elevation..." -ForegroundColor Yellow
    $scriptPath = $PSCommandPath
    Start-Process powershell.exe -Verb RunAs -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$scriptPath`""
    exit
}

$apacheExe = "C:\Users\Star-PC\Apache24\bin\httpd.exe"
$serviceName = "Apache-KarthikJewellers"

try {
    Write-Host "Stopping and removing service $serviceName..." -ForegroundColor Yellow
    Stop-Service -Name $serviceName -ErrorAction SilentlyContinue
    & $apacheExe -k uninstall -n $serviceName
    Write-Host ""
    Write-Host "[SUCCESS] Apache Windows Service uninstalled." -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Failed to uninstall service: $_" -ForegroundColor Red
}

Write-Host ""
Start-Sleep -Seconds 3
