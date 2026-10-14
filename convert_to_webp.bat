@echo off
set CAROUSEL_DIR=src\frontend\carousel-source

echo Converting images to WebP and deleting originals...
echo.

:: Process each file in the carousel folder
for %%f in ("%CAROUSEL_DIR%\\*") do (
    set "FILE=%%~f"
    set "EXT=%%~xf"
    
    :: Check if it's an image we want to convert
    set "LOWER_EXT=%%~xf"
    set "LOWER_EXT=%LOWER_EXT:,=,,%"
    set "LOWER_EXT=%LOWER_:=,,%"
    
    if /i "%LOWER_EXT%" equ ".png" if not exist "%%~dpnf.webp" (
        echo Converting: %%f to WebP
        node -e "
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const input = '%%~f';
const output = input.replace('.png', '.webp');
sharp(input)
  .resize({ height: 300, withoutEnlargement: true })
  .webp({ quality: 75, effort: 4 })
  .toFile(output)
  .then(() => console.log('Converted: ' + input))
  .catch(err => console.error('Error: ' + err.message));
"
        del "%%f"
        echo Deleted original: %%f
    )
    
    if /i "%LOWER_EXT%" equ ".jpg" if not exist "%%~dpnf.webp" (
        echo Converting: %%f to WebP
        node -e "
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const input = '%%~f';
const output = input.replace('.jpg', '.webp');
sharp(input)
  .resize({ height: 300, withoutEnlargement: true })
  .webp({ quality: 75, effort: 4 })
  .toFile(output)
  .then(() => console.log('Converted: ' + input))
  .catch(err => console.error('Error: ' + err.message));
"
        del "%%f"
        echo Deleted original: %%f
    )
    
    if /i "%LOWER_EXT%" equ ".jpeg" if not exist "%%~dpnf.webp" (
        echo Converting: %%f to WebP
        node -e "
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const input = '%%~f';
const output = input.replace('.jpeg', '.webp');
sharp(input)
  .resize({ height: 300, withoutEnlargement: true })
  .webp({ quality: 75, effort: 4 })
  .toFile(output)
  .then(() => console.log('Converted: ' + input))
  .catch(err => console.error('Error: ' + err.message));
"
        del "%%f"
        echo Deleted original: %%f
    )
)

echo.
echo Done! Only WebP files remain in the carousel folder.
dir /b "%CAROUSEL_DIR%"
pause