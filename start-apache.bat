@echo off
title Karthik Jewellers - Apache Enterprise Local Host
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\start-apache.ps1"
pause
