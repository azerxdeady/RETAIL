# Stop Apache and Optionally Node.js
Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host "  STOP KARTHIK JEWELLERS LOCAL ENTERPRISE SERVER SUITE              " -ForegroundColor Yellow
Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host ""

# Stop Apache
$httpd = Get-Process -Name httpd -ErrorAction SilentlyContinue
if ($httpd) {
    Write-Host "Stopping Apache HTTP Server processes (PID $($httpd.Id -join ', '))..." -ForegroundColor Yellow
    Stop-Process -Name httpd -Force -ErrorAction SilentlyContinue
    Write-Host "[OK] Apache HTTP Server stopped." -ForegroundColor Green
} else {
    Write-Host "[INFO] Apache HTTP Server was not running." -ForegroundColor Gray
}

# Stop Node.js Backend
$nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host ""
    $confirm = Read-Host "Do you also want to stop the Node.js backend (Port 5000)? (Y/N) [Default: Y]"
    if ([string]::IsNullOrWhiteSpace($confirm) -or $confirm.Trim().ToUpper() -eq "Y") {
        Stop-Process -Name node -Force -ErrorAction SilentlyContinue
        Write-Host "[OK] Node.js backend stopped." -ForegroundColor Green
    } else {
        Write-Host "[INFO] Node.js backend left running." -ForegroundColor Cyan
    }
} else {
    Write-Host "[INFO] Node.js backend was not running." -ForegroundColor Gray
}

Write-Host ""
Write-Host "Server status checked." -ForegroundColor Gray
Write-Host ""
