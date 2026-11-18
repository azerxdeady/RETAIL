# Check Apache & Node.js Server Health and Display Access URLs
Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host "  KARTHIK JEWELLERS - APACHE & BACKEND HEALTH CHECK                 " -ForegroundColor Yellow
Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host ""

$apacheConn = Get-NetTCPConnection -LocalPort 80 -State Listen -ErrorAction SilentlyContinue
$nodeConn = Get-NetTCPConnection -LocalPort 5000 -State Listen -ErrorAction SilentlyContinue

# Apache Status
if ($apacheConn) {
    Write-Host "[APACHE]   ONLINE - Listening on standard Port 80 (HTTP)" -ForegroundColor Green
} else {
    Write-Host "[APACHE]   OFFLINE - Port 80 is not active" -ForegroundColor Red
}

# Node.js Status
if ($nodeConn) {
    Write-Host "[NODE.JS]  ONLINE - Listening on internal Port 5000" -ForegroundColor Green
} else {
    Write-Host "[NODE.JS]  OFFLINE - Port 5000 is not active" -ForegroundColor Red
}

# Live Rates API Probe
if ($apacheConn -and $nodeConn) {
    Write-Host ""
    Write-Host "Testing End-to-End Reverse Proxy & Live Bullion API..." -ForegroundColor Gray
    try {
        $rates = Invoke-RestMethod -Uri "http://localhost/api/rates" -TimeoutSec 3 -ErrorAction Stop
        if ($rates.success) {
            Write-Host "[API PROBE] SUCCESS - 24KT Gold: ₹$($rates.rates.gold24k)/g | 22KT Gold: ₹$($rates.rates.gold22k)/g | Source: $($rates.rates.source)" -ForegroundColor Green
        }
    } catch {
        Write-Host "[API PROBE] Proxy probe failed: $_" -ForegroundColor Red
    }
}

$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notmatch 'Loopback|vEthernet' -and $_.IPAddress -notmatch '169\.254' } | Select-Object -First 1).IPAddress
$hostName = $env:COMPUTERNAME

Write-Host ""
Write-Host "====================================================================" -ForegroundColor Yellow
Write-Host "  ACTIVE ACCESS URLS (PORT 80 STANDARD - NO PORT NUMBER REQUIRED)   " -ForegroundColor Yellow
Write-Host "====================================================================" -ForegroundColor Yellow
Write-Host "  [This Computer]            http://localhost/" -ForegroundColor Cyan
Write-Host "  [Wi-Fi / Mobile Devices]   http://$($ip)/" -ForegroundColor Green
Write-Host "  [Computer Hostname]        http://$($hostName)/" -ForegroundColor Cyan
Write-Host ""
Write-Host "  PORTALS VIA APACHE:" -ForegroundColor White
Write-Host "   * Karthik Jewellers Store:   http://$($ip)/"
Write-Host "   * Viswanandini Bridal House: http://$($ip)/viswanandini"
Write-Host "   * Master Hub Cockpit:        http://$($ip)/dashboard"
Write-Host "   * Chit Savings (11+1):       http://$($ip)/chit"
Write-Host "   * Admin Live Rates Portal:   http://$($ip)/admin"
Write-Host "   * Real-Time Bullion API:     http://$($ip)/api/rates"
Write-Host "====================================================================" -ForegroundColor Yellow
Write-Host ""
