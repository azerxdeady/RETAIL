@echo off
title Commit and Push to GitHub
echo ====================================================================
echo   COMMIT & PUSH TO GITHUB
echo ====================================================================
echo.
set /p REPO_URL="Enter your GitHub repository URL (e.g. https://github.com/username/RETAIL.git): "
if "%REPO_URL%"=="" (
    echo [ERROR] No repository URL entered. Exiting.
    pause
    exit /b 1
)

echo.
echo [1/4] Staging files...
git add .

echo [2/4] Creating initial commit...
git commit -m "Initial commit: Karthik Jewellers & Viswanandini Retail Ecosystem"

echo [3/4] Setting main branch and remote origin...
git branch -M main
git remote remove origin >nul 2>&1
git remote add origin %REPO_URL%

echo [4/4] Pushing to GitHub...
git push -u origin main

echo.
if %ERRORLEVEL% equ 0 (
    echo ====================================================================
    echo   [SUCCESS] Code successfully pushed to GitHub!
    echo ====================================================================
) else (
    echo ====================================================================
    echo   [ERROR] Push failed. Make sure you are logged in via login-git.bat.
    echo ====================================================================
)
pause
