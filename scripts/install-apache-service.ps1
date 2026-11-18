# Install Apache HTTP Server as a Windows Service (Automatic Startup)
Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host "  INSTALL APACHE AS A NATIVE WINDOWS SERVICE                        " -ForegroundColor Yellow
Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host ""

$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "[INFO] Administrator rights required to register a Windows Service." -ForegroundColor Yellow
    Write-Host "[INFO] Prompting for UAC Elevation..." -ForegroundColor Yellow
    $scriptPath = $PSCommandPath
    Start-Process powershell.exe -Verb RunAs -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$scriptPath`""
    exit
}

$apacheExe = "C:\Users\Star-PC\Apache24\bin\httpd.exe"
$serviceName = "Apache-KarthikJewellers"

try {
    # Stop existing instance if running manually
    Stop-Process -Name httpd -Force -ErrorAction SilentlyContinue

    Write-Host "Registering Windows Service: $serviceName..." -ForegroundColor Yellow
    & $apacheExe -k install -n $serviceName
    
    Write-Host "Setting service to Automatic startup..." -ForegroundColor Yellow
    Set-Service -Name $serviceName -StartupType Automatic
    
    Write-Host "Starting $serviceName..." -ForegroundColor Yellow
    Start-Service -Name $serviceName
    
    Write-Host ""
    Write-Host "[SUCCESS] Apache is now installed as an official Windows Service!" -ForegroundColor Green
    Write-Host "It will automatically start whenever your computer boots up." -ForegroundColor Cyan
} catch {
    Write-Host "[ERROR] Failed to install Apache Windows service: $_" -ForegroundColor Red
}

Write-Host ""
Start-Sleep -Seconds 4
