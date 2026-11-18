@echo off
title Uninstall Apache Windows Service - Karthik Jewellers
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\uninstall-apache-service.ps1"
pause
