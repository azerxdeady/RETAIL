@echo off
title Configure Windows Firewall for Karthik Jewellers Local Host
echo ====================================================================
echo  CONFIGURING WINDOWS DEFENDER FIREWALL FOR LOCAL NETWORK ACCESS
echo ====================================================================
echo.
echo Requesting Administrator permissions to open Ports 5000 and 8080...
echo.

powershell -Command "Start-Process powershell -Verb RunAs -ArgumentList '-NoProfile -ExecutionPolicy Bypass -Command \"Write-Host \"\"Adding Inbound Firewall Rule for Port 5000 (Node.js)...\"\" -ForegroundColor Yellow; netsh advfirewall firewall add rule name=\"\"Karthik Jewellers Local Server (Port 5000)\"\" dir=in action=allow protocol=TCP localport=5000; Write-Host \"\"Adding Inbound Firewall Rule for Port 8080 (Spring Boot)...\"\" -ForegroundColor Yellow; netsh advfirewall firewall add rule name=\"\"Karthik Jewellers Spring Boot (Port 8080)\"\" dir=in action=allow protocol=TCP localport=8080; Write-Host \"\"`n[SUCCESS] Firewall rules created successfully! Tablets, phones and other PCs on your Wi-Fi can now connect.\"\" -ForegroundColor Green; Start-Sleep -Seconds 3\"'"

echo Done. Check the elevated window for confirmation.
pause
