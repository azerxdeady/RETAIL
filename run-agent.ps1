# Karthik Jewellers - Datadog Agent Observability Launcher
$host.UI.RawUI.WindowTitle = "Karthik Jewellers - Datadog Agent Observability"

$env:Path = "C:\Users\Star-PC\python-3.12;C:\Users\Star-PC\python-3.12\Scripts;$env:Path"

$env:DD_SITE = "us5.datadoghq.com"
$env:DD_LLMOBS_ML_APP = "karthik"
$env:DD_API_KEY = "f57ab367e31fec168630246caf16c58f"
$env:DD_LLMOBS_ENABLED = "true"
$env:DD_LLMOBS_AGENTLESS_ENABLED = "true"
$env:RETAIL_API_BASE = "http://localhost:8080"

Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host "  KARTHIK JEWELLERS - DATADOG AGENT OBSERVABILITY RUNNER             " -ForegroundColor Yellow
Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host " Datadog Site:    $env:DD_SITE" -ForegroundColor Gray
Write-Host " ML App Name:     $env:DD_LLMOBS_ML_APP" -ForegroundColor Gray
Write-Host " Retail Backend:  $env:RETAIL_API_BASE" -ForegroundColor Gray
Write-Host "====================================================================" -ForegroundColor Cyan

python karthik_agent.py $args
