@echo off

REM Setup Environment Files Script for Windows
REM This script creates .env files from the example templates

echo 🚀 Setting up environment files...

REM Copy environment files
if exist "env.example" (
    copy env.example .env >nul
    echo ✅ Created root .env file
) else (
    echo ❌ env.example not found
)

if exist "client\env.example" (
    copy client\env.example client\.env >nul
    echo ✅ Created client\.env file
) else (
    echo ❌ client\env.example not found
)

if exist "server\env.example" (
    copy server\env.example server\.env >nul
    echo ✅ Created server\.env file
) else (
    echo ❌ server\env.example not found
)

echo.
echo 🎉 Environment setup complete!
echo.
echo 📝 Next steps:
echo 1. Review the .env files and update values if needed
echo 2. Run 'npm run install-all' to install dependencies
echo 3. Run 'npm run dev' to start the application
echo.
echo ⚠️  Remember: Never commit .env files to version control!

pause
