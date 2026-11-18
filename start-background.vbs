' Karthik Jewellers - Silent Background Server Launcher
' Runs node server.js with no terminal window visible.
Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "C:\Users\Star-PC\Documents\Github\RETAIL"
WshShell.Run "cmd /c node server.js", 0, False
Set WshShell = Nothing
