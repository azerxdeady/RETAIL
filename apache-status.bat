@echo off
title Karthik Jewellers Apache Server Status
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\apache-status.ps1"
pause
