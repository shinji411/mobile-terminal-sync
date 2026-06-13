@echo off
REM pocket-claude stopper - kills whatever is listening on port 3210
REM /T kills the whole process tree (server + persistent claude children),
REM otherwise claude.exe orphans survive the /F force-kill (reaper hooks
REM in server.ts do not run under taskkill /F).
setlocal
set FOUND=0
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":3210" ^| findstr "LISTENING"') do (
  taskkill /T /F /PID %%p >nul 2>&1
  set FOUND=1
)
if "%FOUND%"=="1" (
  echo pocket-claude stopped.
) else (
  echo pocket-claude is not running.
)
endlocal
