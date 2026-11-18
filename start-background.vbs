' Karthik Jewellers & Viswanandini Bridal House - Silent Background Server Suite
' Launches both Node.js Express Backend (Port 5000) and Apache HTTP Server (Port 80) silently with no window.
Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "C:\Users\Star-PC\Documents\Github\RETAIL"
WshShell.Run "cmd /c node server.js", 0, False
WshShell.Run "C:\Users\Star-PC\Apache24\bin\httpd.exe", 0, False
Set WshShell = Nothing
