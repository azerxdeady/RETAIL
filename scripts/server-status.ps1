Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host "  KARTHIK JEWELLERS - LOCAL SERVER HEALTH & ACCESS STATUS           " -ForegroundColor Yellow
Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host ""

$conn = Get-NetTCPConnection -LocalPort 5000 -State Listen -ErrorAction SilentlyContinue
if ($conn) {
    Write-Host "[STATUS] ● SERVER IS ONLINE AND LISTENING ON PORT 5000" -ForegroundColor Green
    $ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notmatch 'Loopback|vEthernet' -and $_.IPAddress -notmatch '169\.254' } | Select-Object -First 1).IPAddress
    $hostName = $env:COMPUTERNAME

    Write-Host ""
    Write-Host "====================================================================" -ForegroundColor Yellow
    Write-Host "  ACCESS URLS FOR DEVICES ON YOUR LOCAL NETWORK (Wi-Fi / LAN)       " -ForegroundColor Yellow
    Write-Host "====================================================================" -ForegroundColor Yellow
    Write-Host "  💻 On this computer:          http://localhost:5000" -ForegroundColor Cyan
    Write-Host "  📶 On phones/tablets/POS PCs: http://$($ip):5000" -ForegroundColor Green
    Write-Host "  🏷️ Via Computer Name:        http://$($hostName):5000" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  DIRECT PORTALS:" -ForegroundColor White
    Write-Host "   • Karthik Storefront:        http://$($ip):5000"
    Write-Host "   • Viswanandini Bridal House: http://$($ip):5000/viswanandini"
    Write-Host "   • Master Hub Cockpit:        http://$($ip):5000/dashboard"
    Write-Host "   • Admin Command Center:      http://$($ip):5000/admin"
    Write-Host "   • GST Tax Invoice System:    http://$($ip):5000/invoice"
    Write-Host "====================================================================" -ForegroundColor Yellow
} else {
    Write-Host "[STATUS] ○ SERVER IS CURRENTLY STOPPED" -ForegroundColor Red
    Write-Host "Run start.bat or start-background.vbs to start the server." -ForegroundColor Yellow
}

Write-Host ""
