@echo off
title Setup Apache HTTP Server - Karthik Jewellers
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\setup-apache.ps1"
pause
