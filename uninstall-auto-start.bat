@echo off
title Remove Karthik Jewellers Auto-Start Service
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\uninstall-auto-start.ps1"
pause
