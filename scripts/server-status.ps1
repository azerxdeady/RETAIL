Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host "  KARTHIK JEWELLERS - LOCAL SERVER HEALTH & ACCESS STATUS           " -ForegroundColor Yellow
Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host ""

$apacheConn = Get-NetTCPConnection -LocalPort 80 -State Listen -ErrorAction SilentlyContinue
$nodeConn = Get-NetTCPConnection -LocalPort 5000 -State Listen -ErrorAction SilentlyContinue

$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notmatch 'Loopback|vEthernet' -and $_.IPAddress -notmatch '169\.254' } | Select-Object -First 1).IPAddress
$hostName = $env:COMPUTERNAME

if ($apacheConn -and $nodeConn) {
    Write-Host "[STATUS] ENTERPRISE SERVER SUITE ONLINE (Apache Port 80 + Node Port 5000)" -ForegroundColor Green
    Write-Host ""
    Write-Host "====================================================================" -ForegroundColor Yellow
    Write-Host "  PRIMARY ACCESS URLS (PORT 80 - NO PORT NUMBER REQUIRED!)          " -ForegroundColor Yellow
    Write-Host "====================================================================" -ForegroundColor Yellow
    Write-Host "  [PC]   On this computer:          http://localhost/" -ForegroundColor Cyan
    Write-Host "  [LAN]  On phones/tablets/POS PCs: http://$($ip)/" -ForegroundColor Green
    Write-Host "  [HOST] Via Computer Name:         http://$($hostName)/" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  DIRECT PORTALS:" -ForegroundColor White
    Write-Host "   * Karthik Storefront:        http://$($ip)/"
    Write-Host "   * Viswanandini Bridal House: http://$($ip)/viswanandini"
    Write-Host "   * Master Hub Cockpit:        http://$($ip)/dashboard"
    Write-Host "   * Chit Scheme (11+1):        http://$($ip)/chit"
    Write-Host "   * Admin Live Rates Portal:   http://$($ip)/admin"
    Write-Host "   * Real-Time Bullion API:     http://$($ip)/api/rates"
    Write-Host "====================================================================" -ForegroundColor Yellow
} elseif ($nodeConn) {
    Write-Host "[STATUS] NODE.JS BACKEND ONLINE (PORT 5000), APACHE OFFLINE" -ForegroundColor Yellow
    Write-Host "Direct Node.js URL: http://$($ip):5000" -ForegroundColor Cyan
    Write-Host "To start Apache Port 80 proxy, run start-apache.bat" -ForegroundColor Yellow
} else {
    Write-Host "[STATUS] SERVER IS CURRENTLY STOPPED" -ForegroundColor Red
    Write-Host "Run start-apache.bat or start.bat to start the servers." -ForegroundColor Yellow
}

Write-Host ""
