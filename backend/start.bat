@echo off
d:
cd "d:\DiskE\sự kiện lta\LTA PROJECT NEW\Web\backend"
echo Backend directory: %CD%
echo Starting backend server on port 3005...
npx tsx src/server.ts
pause