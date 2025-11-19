@echo off
echo ============================================
echo FORCE REGENERATE PRISMA CLIENT
echo ============================================
echo.

echo Step 1: Stopping all Node processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo Step 2: Removing old Prisma Client cache...
if exist "node_modules\.prisma" (
    rmdir /s /q "node_modules\.prisma"
    echo   - Removed .prisma folder
) else (
    echo   - .prisma folder not found
)

echo.
echo Step 3: Generating new Prisma Client...
call npx prisma generate

echo.
echo ============================================
echo DONE! Now you can start your server.
echo ============================================
pause
