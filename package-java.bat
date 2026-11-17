@echo off
title Karthik Jewellers - Maven Build and Package
echo ====================================================================
echo   BUILDING KARTHIK JEWELLERS ENTERPRISE JAR (MAVEN)
echo ====================================================================

set "JAVA_HOME=C:\Users\Star-PC\jdk-21"
set "M2_HOME=C:\Users\Star-PC\maven-3.9"
set "PATH=%JAVA_HOME%\bin;%M2_HOME%\bin;%PATH%"

echo [1/3] Releasing file locks on target JAR if running...
powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \"Name = 'java.exe'\" | Where-Object { $_.CommandLine -like '*retail-ecosystem*' } | Invoke-CimMethod -MethodName Terminate | Out-Null" >nul 2>&1
powershell -Command "Start-Sleep -Milliseconds 500" >nul 2>&1

echo [2/3] Compiling and packaging Spring Boot executable JAR...
call mvn clean package -DskipTests

echo.
echo [3/3] Build Verification:
if %ERRORLEVEL% equ 0 (
    echo ====================================================================
    echo   [SUCCESS] Clean build completed successfully!
    echo   Executable JAR: target\retail-ecosystem-1.0.0.jar
    echo   Launch anytime via: run-java.bat
    echo ====================================================================
) else (
    echo ====================================================================
    echo   [ERROR] Maven build failed with exit code %ERRORLEVEL%.
    echo   Please inspect compiler output above.
    echo ====================================================================
)
pause
