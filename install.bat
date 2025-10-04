@echo off
echo Installing Collaborative Task Board...
echo.

echo Setting up environment files...
call setup-env.bat

echo.
echo Installing root dependencies...
npm install

echo.
echo Installing server dependencies...
cd server
npm install

echo.
echo Installing client dependencies...
cd ../client
npm install

echo.
echo Installation complete!
echo.
echo To start the application, run: npm run dev
echo.
pause
