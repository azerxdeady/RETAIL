@echo off
title Karthik Jewellers - Datadog Agent Observability
echo ====================================================================
echo   KARTHIK JEWELLERS - DATADOG AGENT OBSERVABILITY RUNNER
echo ====================================================================

set "PATH=C:\Users\Star-PC\python-3.12;C:\Users\Star-PC\python-3.12\Scripts;%PATH%"

set "DD_SITE=us5.datadoghq.com"
set "DD_LLMOBS_ML_APP=karthik"
set "DD_API_KEY=f57ab367e31fec168630246caf16c58f"
set "DD_LLMOBS_ENABLED=true"
set "DD_LLMOBS_AGENTLESS_ENABLED=true"
set "RETAIL_API_BASE=http://localhost:8080"

python karthik_agent.py %*
pause
