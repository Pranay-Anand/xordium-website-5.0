@echo off
cd C:\Users\aayus\WebstormProjects\xordium-website-5.0
echo.
echo === Carousel Debug Tool ===
echo.
echo 1. Checking if dev server is running...
timeout /t 2 /nobreak >nul
echo.
echo 2. Testing API endpoint...
curl -s http://localhost:3000/api/carousel > response.txt 2>&1
echo Response saved to response.txt
type response.txt
echo.
echo 3. Checking database connection...
timeout /t 1 /nobreak >nul
echo.
echo 4. Checking carousel source images...
dir /b src\frontend\carousel-source
echo.
echo === Done ===