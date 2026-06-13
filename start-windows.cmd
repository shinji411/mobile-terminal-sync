@echo off
REM pocket-claude launcher - works from PowerShell / CMD / double-click
REM Usage: start-windows.cmd [fable] [local|rotate]   (default model: Opus 4.8)
set "PC_MODEL=Opus 4.8"
echo %* | findstr /i "fable" >nul && set "PC_MODEL=Fable 5"
echo ============================================
echo  pocket-claude  ^|  Model: %PC_MODEL%
echo  (pass 'fable' for Fable 5; default is Opus 4.8)
echo ============================================
"C:\Program Files\Git\bin\bash.exe" "%~dp0start-windows.sh" %*
