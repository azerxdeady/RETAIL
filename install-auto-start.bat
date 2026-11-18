@echo off
title Install Karthik Jewellers Auto-Start Service
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\install-auto-start.ps1"
pause
