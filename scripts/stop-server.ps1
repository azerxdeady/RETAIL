Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host "  STOPPING KARTHIK JEWELLERS LOCAL SERVER                           " -ForegroundColor Yellow
Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host ""

$conn = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
if ($conn) {
    $pids = $conn | Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($p in $pids) {
        Write-Host "Stopping Server Process PID: $p" -ForegroundColor Yellow
        Stop-Process -Id $p -Force -ErrorAction SilentlyContinue
    }
    Write-Host "[SUCCESS] Server on port 5000 stopped successfully." -ForegroundColor Green
} else {
    Write-Host "No server process was found running on port 5000." -ForegroundColor Cyan
}

Write-Host ""
