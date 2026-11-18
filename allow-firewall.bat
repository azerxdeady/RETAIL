@echo off
title Configure Windows Firewall for Karthik Jewellers Local Host
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\allow-firewall.ps1"
pause
