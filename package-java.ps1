# Karthik Jewellers & Viswanandini Retail Ecosystem - Package Script
$host.UI.RawUI.WindowTitle = "Karthik Jewellers - Maven Build and Package"

$env:JAVA_HOME = "C:\Users\Star-PC\jdk-21"
$env:M2_HOME = "C:\Users\Star-PC\maven-3.9"
$env:Path = "C:\Users\Star-PC\jdk-21\bin;C:\Users\Star-PC\maven-3.9\bin;$env:Path"

Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host "  BUILDING KARTHIK JEWELLERS ENTERPRISE JAR (MAVEN)                  " -ForegroundColor Yellow
Write-Host "====================================================================" -ForegroundColor Cyan

Write-Host "[1/3] Releasing file locks on target JAR if running..." -ForegroundColor Gray
Get-CimInstance Win32_Process -Filter "Name = 'java.exe'" -ErrorAction SilentlyContinue |
    Where-Object { $_.CommandLine -like "*retail-ecosystem*" } |
    Invoke-CimMethod -MethodName Terminate -ErrorAction SilentlyContinue | Out-Null

Start-Sleep -Milliseconds 500

Write-Host "[2/3] Compiling and packaging Spring Boot executable JAR..." -ForegroundColor Gray
mvn clean package -DskipTests

Write-Host ""
Write-Host "[3/3] Build Verification:" -ForegroundColor Cyan
if ($LASTEXITCODE -eq 0) {
    Write-Host "====================================================================" -ForegroundColor Green
    Write-Host "  [SUCCESS] Clean build completed successfully!" -ForegroundColor Green
    Write-Host "  Executable JAR: target\retail-ecosystem-1.0.0.jar" -ForegroundColor Green
    Write-Host "  Launch anytime via: .\run-java.ps1 or run-java.bat" -ForegroundColor Green
    Write-Host "====================================================================" -ForegroundColor Green
} else {
    Write-Host "====================================================================" -ForegroundColor Red
    Write-Host "  [ERROR] Maven build failed with exit code $LASTEXITCODE" -ForegroundColor Red
    Write-Host "  Please inspect compiler output above." -ForegroundColor Red
    Write-Host "====================================================================" -ForegroundColor Red
}
