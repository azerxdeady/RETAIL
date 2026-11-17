# Karthik Jewellers & Viswanandini Retail Ecosystem - Spring Boot Launcher
$env:JAVA_HOME = "C:\Users\Star-PC\jdk-21"
$env:M2_HOME = "C:\Users\Star-PC\maven-3.9"
$env:Path = "C:\Users\Star-PC\jdk-21\bin;C:\Users\Star-PC\maven-3.9\bin;$env:Path"

Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host "  KARTHIK JEWELLERS & VISWANANDINI LUXURY ECOSYSTEM (JAVA 21)        " -ForegroundColor Yellow
Write-Host "====================================================================" -ForegroundColor Cyan

if (Test-Path "target\retail-ecosystem-1.0.0.jar") {
    Write-Host "[INFO] Launching pre-built Spring Boot executable JAR on port 8080..." -ForegroundColor Green
    java -jar target\retail-ecosystem-1.0.0.jar
} else {
    Write-Host "[INFO] JAR not found, compiling and launching via Maven Wrapper..." -ForegroundColor Yellow
    .\mvnw.cmd spring-boot:run
}
