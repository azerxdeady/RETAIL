Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host "  STOPPING KARTHIK JEWELLERS LOCAL ENTERPRISE SERVER SUITE          " -ForegroundColor Yellow
Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host ""

# Stop Apache
$apacheConn = Get-NetTCPConnection -LocalPort 80 -ErrorAction SilentlyContinue
if ($apacheConn) {
    $apachePids = $apacheConn | Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($p in $apachePids) {
        Write-Host "Stopping Apache Process PID: $p" -ForegroundColor Yellow
        Stop-Process -Id $p -Force -ErrorAction SilentlyContinue
    }
}
Stop-Process -Name httpd -Force -ErrorAction SilentlyContinue
Write-Host "[OK] Apache HTTP Server stopped." -ForegroundColor Green

# Stop Node.js Backend
$nodeConn = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
if ($nodeConn) {
    $nodePids = $nodeConn | Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($p in $nodePids) {
        Write-Host "Stopping Node.js Server Process PID: $p" -ForegroundColor Yellow
        Stop-Process -Id $p -Force -ErrorAction SilentlyContinue
    }
    Write-Host "[OK] Node.js backend on Port 5000 stopped." -ForegroundColor Green
} else {
    Write-Host "No server process was found running on port 5000." -ForegroundColor Cyan
}

Write-Host ""
Write-Host "[SUCCESS] All local servers stopped." -ForegroundColor Green
Write-Host ""
