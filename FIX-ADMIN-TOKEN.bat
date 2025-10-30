@echo off
echo ============================================================
echo      ADMIN TOKEN REFRESH - QUICK SOLUTION
echo ============================================================
echo.
echo Ban dang bi yeu cau dang nhap lai vi:
echo   1. Token cu da het han (JWT expires sau 7 ngay)
echo   2. Token issued truoc khi fix permissions_updated_at
echo.
echo ============================================================
echo      GIAI PHAP
echo ============================================================
echo.
echo CACH 1: DANG NHAP LAI TREN WEBSITE (KHUYEN NGHI)
echo --------------------------------------------------------
echo 1. Mo browser va vao: http://localhost:3000/vi/login
echo 2. Nhap email: admin@i-contexchange.vn
echo 3. Nhap password (ban da biet)
echo 4. Click Dang nhap
echo 5. XONG! Token moi tu dong luu vao cookie
echo.
echo.
echo CACH 2: SU DUNG CONSOLE (ADVANCED)
echo --------------------------------------------------------
echo 1. Mo DevTools (F12)
echo 2. Vao tab Console
echo 3. Chay lenh sau:
echo.
echo    document.cookie = "accessToken=; path=/; max-age=0";
echo    location.href = "/vi/login";
echo.
echo 4. Dang nhap lai
echo.
echo.
echo CACH 3: XOA COOKIE (MANUAL)
echo --------------------------------------------------------
echo 1. Mo DevTools (F12)
echo 2. Vao tab Application ^> Cookies ^> localhost:3000
echo 3. Click phai vao cookie "accessToken" ^> Delete
echo 4. Refresh trang (F5)
echo 5. Dang nhap lai
echo.
echo ============================================================
pause
