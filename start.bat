@echo off
title Karthik Jewellers - Enterprise Local Server Host
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\start-apache.ps1"
pause
