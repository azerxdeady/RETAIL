@echo off
title Karthik Jewellers - E-Commerce and Admin Ecosystem
set "PATH=C:\Users\Star-PC\nodejs;%PATH%"

echo ================================================================
echo  ✨ KARTHIK JEWELLERS - FINE JEWELLERY & ADMIN ECOSYSTEM ✨
echo ================================================================
echo.
echo Starting server on http://localhost:5000 ...
echo.
echo  🎛️  Master Hub Dashboard: http://localhost:5000/dashboard
echo  🛍️  Karthik Flagship:     http://localhost:5000
echo  👑  Viswanandini Bridal:   http://localhost:5000/viswanandini
echo  ⚙️  Admin Command Center:  http://localhost:5000/admin
echo  📄  GST Tax Invoice:       http://localhost:5000/invoice
echo.
echo Press Ctrl+C anytime to stop the server.
echo.

node server.js
pause
