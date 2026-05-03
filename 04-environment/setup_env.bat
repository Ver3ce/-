@echo off
echo ========================================
echo   Environment Setup Script
echo ========================================
echo.
echo Checking environment...
echo.

REM Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [X] Node.js not found. Please install Node.js 18+
    echo     Download: https://nodejs.org/
) else (
    echo [OK] Node.js installed
    node --version
)

echo.

REM Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [X] Python not found. Please install Python 3.10+
    echo     Download: https://www.python.org/
) else (
    echo [OK] Python installed
    python --version
)

echo.
echo ========================================
echo Installing project dependencies...
echo ========================================
echo.

if exist "..\01-source-code\package.json" (
    echo Installing Node.js dependencies...
    cd "..\01-source-code"
    call npm install
    if %errorlevel% equ 0 (
        echo [OK] Node.js dependencies installed
    ) else (
        echo [X] Node.js dependencies failed
    )
    cd "..\04-environment"
)

echo.

if exist "requirements.txt" (
    echo Installing Python dependencies...
    pip install -r requirements.txt
    if %errorlevel% equ 0 (
        echo [OK] Python dependencies installed
    ) else (
        echo [X] Python dependencies failed
    )
)

echo.
echo ========================================
echo Setup complete!
echo ========================================
echo.
pause
