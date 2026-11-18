# ====================================================================
# KARTHIK JEWELLERS - APACHE ENTERPRISE WEB SERVER AUTOMATED SETUP
# ====================================================================

$ErrorActionPreference = "Stop"

$userProfile = [Environment]::GetFolderPath('UserProfile')
$ApacheRoot = Join-Path $userProfile "Apache24"
$httpdExe = Join-Path $ApacheRoot "bin\httpd.exe"
$projectDir = Split-Path -Parent $PSScriptRoot

Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host "  KARTHIK JEWELLERS - APACHE ENTERPRISE WEB SERVER SETUP            " -ForegroundColor Yellow
Write-Host "====================================================================" -ForegroundColor Cyan

# 1. Download & Extract Apache if not present
if (-not (Test-Path $httpdExe)) {
    Write-Host "[1/4] Downloading Apache HTTP Server 2.4 Win64 from Apache Lounge..." -ForegroundColor Cyan
    $zipUrl = "https://www.apachelounge.com/download/VS18/binaries/httpd-2.4.71-261112-Win64-VS18.zip"
    $tempZip = Join-Path $env:TEMP "httpd-apache24.zip"

    try {
        [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12
        $wc = New-Object System.Net.WebClient
        $wc.Headers.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)")
        $wc.DownloadFile($zipUrl, $tempZip)
        Write-Host "      Downloaded successfully! Archive size: $((Get-Item $tempZip).Length / 1MB | ForEach-Object { '{0:N2} MB' -f $_ })" -ForegroundColor Green
    }
    catch {
        Write-Host "[ERROR] Could not download Apache archive: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }

    Write-Host "[2/4] Extracting Apache into $ApacheRoot ..." -ForegroundColor Cyan
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $zip = [System.IO.Compression.ZipFile]::OpenRead($tempZip)
    foreach ($entry in $zip.Entries) {
        if ($entry.FullName.StartsWith("Apache24/")) {
            $relPath = $entry.FullName.Substring("Apache24/".Length)
            if ([string]::IsNullOrEmpty($relPath)) { continue }
            $targetPath = Join-Path $ApacheRoot $relPath.Replace('/', [System.IO.Path]::DirectorySeparatorChar)
            if ($entry.FullName.EndsWith("/")) {
                if (-not (Test-Path $targetPath)) {
                    [System.IO.Directory]::CreateDirectory($targetPath) | Out-Null
                }
            } else {
                $parentDir = [System.IO.Path]::GetDirectoryName($targetPath)
                if (-not (Test-Path $parentDir)) {
                    [System.IO.Directory]::CreateDirectory($parentDir) | Out-Null
                }
                [System.IO.Compression.ZipFileExtensions]::ExtractToFile($entry, $targetPath, $true)
            }
        }
    }
    $zip.Dispose()
    Remove-Item $tempZip -Force -ErrorAction SilentlyContinue
}
else {
    Write-Host "[1/4] Apache HTTP Server already installed at $ApacheRoot" -ForegroundColor Green
}

if (-not (Test-Path $httpdExe)) {
    Write-Host "[ERROR] httpd.exe was not found at $httpdExe" -ForegroundColor Red
    exit 1
}

Write-Host "[2/4] Configuring Apache Reverse Proxy Directives..." -ForegroundColor Cyan
& node (Join-Path $projectDir "scripts\setup-apache-conf.js")

Write-Host "[3/4] Testing Apache configuration syntax..." -ForegroundColor Cyan
$testResult = & $httpdExe -t 2>&1
Write-Host "      $testResult" -ForegroundColor Green

Write-Host "[4/4] Apache HTTP Server setup successfully at $ApacheRoot" -ForegroundColor Green
Write-Host ""
Write-Host "You can now run 'start-apache.bat' to start the local hosting suite." -ForegroundColor Yellow
