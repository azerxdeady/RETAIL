@echo off
title Karthik Jewellers Local Server Status
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\server-status.ps1"
pause
