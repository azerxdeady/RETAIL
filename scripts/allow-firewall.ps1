# Configure Windows Defender Firewall Inbound Rules for Port 5000 and 8080
Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host "  CONFIGURING WINDOWS DEFENDER FIREWALL FOR LOCAL NETWORK ACCESS     " -ForegroundColor Yellow
Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host ""

$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "[INFO] Requesting Administrator elevation..." -ForegroundColor Yellow
    $scriptPath = $PSCommandPath
    Start-Process powershell.exe -Verb RunAs -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$scriptPath`""
    exit
}

try {
    Write-Host "Adding Inbound Rule for Port 5000 (Node.js Server)..." -ForegroundColor Yellow
    netsh advfirewall firewall delete rule name="Karthik Jewellers Local Server (Port 5000)" > $null 2>&1
    netsh advfirewall firewall add rule name="Karthik Jewellers Local Server (Port 5000)" dir=in action=allow protocol=TCP localport=5000 > $null

    Write-Host "Adding Inbound Rule for Port 8080 (Spring Boot Server)..." -ForegroundColor Yellow
    netsh advfirewall firewall delete rule name="Karthik Jewellers Spring Boot (Port 8080)" > $null 2>&1
    netsh advfirewall firewall add rule name="Karthik Jewellers Spring Boot (Port 8080)" dir=in action=allow protocol=TCP localport=8080 > $null

    Write-Host ""
    Write-Host "[SUCCESS] Windows Defender Firewall rules created successfully!" -ForegroundColor Green
    Write-Host "Phones, tablets, and billing computers on your Wi-Fi network can now connect." -ForegroundColor Cyan
} catch {
    Write-Host "[ERROR] Failed to configure firewall: $_" -ForegroundColor Red
}

Write-Host ""
Start-Sleep -Seconds 3
