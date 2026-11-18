@echo off
title Stop Karthik Jewellers Apache Server
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\stop-apache.ps1"
pause
