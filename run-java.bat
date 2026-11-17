@echo off
title Karthik Jewellers - Enterprise Java Spring Boot Ecosystem
echo ====================================================================
echo   KARTHIK JEWELLERS - ENTERPRISE JAVA ECOSYSTEM (PORT 8080)
echo ====================================================================

set "JAVA_HOME=C:\Users\Star-PC\jdk-21"
set "M2_HOME=C:\Users\Star-PC\maven-3.9"
set "PATH=%JAVA_HOME%\bin;%M2_HOME%\bin;%PATH%"

powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \"Name = 'java.exe'\" | Where-Object { $_.CommandLine -like '*retail-ecosystem*' } | Invoke-CimMethod -MethodName Terminate | Out-Null" >nul 2>&1
powershell -Command "Start-Sleep -Milliseconds 500" >nul 2>&1

if exist "target\retail-ecosystem-1.0.0.jar" (
    echo [INFO] Launching enterprise Spring Boot JAR on http://localhost:8080 ...
    java -jar target\retail-ecosystem-1.0.0.jar
) else (
    echo [INFO] Target JAR not found, building and running with Maven...
    mvn spring-boot:run
)
pause
