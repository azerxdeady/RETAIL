# Start Karthik Jewellers Local Enterprise Server Suite (Apache + Node.js)
Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host "  KARTHIK JEWELLERS - APACHE ENTERPRISE LOCAL HOSTING CONTROLLER    " -ForegroundColor Yellow
Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host ""

$projectDir = Split-Path -Parent $PSScriptRoot
$apacheExe = "C:\Users\Star-PC\Apache24\bin\httpd.exe"

# 1. Check & Start Node.js Backend (Port 5000)
$nodeConn = Get-NetTCPConnection -LocalPort 5000 -State Listen -ErrorAction SilentlyContinue
if (-not $nodeConn) {
    Write-Host "[1/3] Starting Node.js backend on Port 5000..." -ForegroundColor Yellow
    $vbsPath = Join-Path $projectDir "start-background.vbs"
    if (Test-Path $vbsPath) {
        Start-Process "wscript.exe" -ArgumentList "`"$vbsPath`"" -WorkingDirectory $projectDir
    } else {
        Start-Process "cmd.exe" -ArgumentList "/c start /min `"Node Backend`" node server.js" -WorkingDirectory $projectDir
    }
    
    # Wait up to 5 seconds for Node.js
    $waited = 0
    while ($waited -lt 5) {
        Start-Sleep -Seconds 1
        $waited++
        $nodeConn = Get-NetTCPConnection -LocalPort 5000 -State Listen -ErrorAction SilentlyContinue
        if ($nodeConn) { break }
    }
}

if ($nodeConn) {
    Write-Host "[OK] Node.js backend is active on Port 5000" -ForegroundColor Green
} else {
    Write-Host "[WARNING] Node.js backend did not report listening on Port 5000 within 5 seconds" -ForegroundColor Red
}

# 2. Check & Start Apache HTTP Server (Port 80)
$apacheConn = Get-NetTCPConnection -LocalPort 80 -State Listen -ErrorAction SilentlyContinue
if (-not $apacheConn) {
    Write-Host "[2/3] Starting Apache HTTP Server on standard Port 80..." -ForegroundColor Yellow
    if (Test-Path $apacheExe) {
        Start-Process "cmd.exe" -ArgumentList "/c start /min `"Apache Server`" `"$apacheExe`""
        
        # Wait up to 5 seconds for Apache
        $waited = 0
        while ($waited -lt 5) {
            Start-Sleep -Seconds 1
            $waited++
            $apacheConn = Get-NetTCPConnection -LocalPort 80 -State Listen -ErrorAction SilentlyContinue
            if ($apacheConn) { break }
        }
    } else {
        Write-Host "[ERROR] Apache executable not found at: $apacheExe" -ForegroundColor Red
    }
}

if ($apacheConn) {
    Write-Host "[OK] Apache HTTP Server is active on standard Port 80" -ForegroundColor Green
} else {
    Write-Host "[WARNING] Apache did not bind to Port 80. Check C:\Users\Star-PC\Apache24\logs\error_log" -ForegroundColor Red
}

# 3. Network Discovery and URLs
$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notmatch 'Loopback|vEthernet' -and $_.IPAddress -notmatch '169\.254' } | Select-Object -First 1).IPAddress
$hostName = $env:COMPUTERNAME

Write-Host ""
Write-Host "====================================================================" -ForegroundColor Yellow
Write-Host "  ENTERPRISE LOCAL HOSTING ACCESS DIRECTORY                         " -ForegroundColor Yellow
Write-Host "====================================================================" -ForegroundColor Yellow
Write-Host "  [PC Local Access]          http://localhost/" -ForegroundColor Cyan
Write-Host "  [Wi-Fi / Mobile Access]    http://$($ip)/" -ForegroundColor Green
Write-Host "  [Hostname Access]          http://$($hostName)/" -ForegroundColor Cyan
Write-Host ""
Write-Host "  DIRECT PORTAL SHORTCUTS:" -ForegroundColor White
Write-Host "   * Karthik Jewellers Store:   http://$($ip)/"
Write-Host "   * Viswanandini Bridal House: http://$($ip)/viswanandini"
Write-Host "   * Master Hub Cockpit:        http://$($ip)/dashboard"
Write-Host "   * Chit Savings (11+1):       http://$($ip)/chit"
Write-Host "   * Admin Live Rates Portal:   http://$($ip)/admin"
Write-Host "   * Real-Time Bullion API:     http://$($ip)/api/rates"
Write-Host "====================================================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "Apache is proxying requests to the Node.js backend transparently." -ForegroundColor Gray
Write-Host "Phones, tablets, and POS devices on your Wi-Fi do NOT need any port numbers!" -ForegroundColor Green
Write-Host ""
