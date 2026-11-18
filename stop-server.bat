@echo off
title Stop Karthik Jewellers Local Server
echo ====================================================================
echo  STOPPING KARTHIK JEWELLERS LOCAL SERVER
echo ====================================================================
echo.

powershell -NoProfile -Command "
$conn = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
if ($conn) {
    $pids = $conn | Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($p in $pids) {
        Write-Host ('Stopping Server Process PID: ' + $p) -ForegroundColor Yellow
        Stop-Process -Id $p -Force -ErrorAction SilentlyContinue
    }
    Write-Host 'Server successfully stopped.' -ForegroundColor Green
} else {
    Write-Host 'No server process was running on port 5000.' -ForegroundColor Cyan
}
"

echo.
pause
