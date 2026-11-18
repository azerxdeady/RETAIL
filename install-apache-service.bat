@echo off
title Install Apache as Windows Service - Karthik Jewellers
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\install-apache-service.ps1"
pause
