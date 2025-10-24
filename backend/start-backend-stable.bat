@echo off
echo Starting i-ContExchange Backend Server...
cd /d "D:\DiskE\SUKIENLTA\LTA PROJECT NEW\Web\backend"

set PORT=3006
set NODE_ENV=development

echo Port: %PORT%
echo Environment: %NODE_ENV%
echo Directory: %CD%

:start
echo [%date% %time%] Starting backend server on port %PORT%...
node --import tsx src/server.ts

if %ERRORLEVEL% NEQ 0 (
    echo [%date% %time%] Server crashed with error code %ERRORLEVEL%
    echo Restarting in 5 seconds...
    timeout /t 5 /nobreak >nul
    goto start
)

echo [%date% %time%] Server stopped normally
pause