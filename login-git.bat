@echo off
title GitHub and Git Authentication
echo ====================================================================
echo   GITHUB & GIT LOGIN HELPER
echo ====================================================================
echo.
echo Launching GitHub CLI authentication...
echo.
echo 1. Select "GitHub.com"
echo 2. Select "HTTPS"
echo 3. Select "Yes" to authenticate Git with your GitHub credentials
echo 4. Select "Login with a web browser"
echo 5. Copy the one-time code and authorize in your browser
echo.
pause
gh auth login -p https -w
echo.
echo Configuring Git credential helper...
gh auth setup-git
echo.
echo ====================================================================
echo   Authentication Complete!
echo ====================================================================
gh auth status
pause
