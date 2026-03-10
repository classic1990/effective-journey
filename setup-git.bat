@echo off
echo === 25-HD Movie Streaming - Git Setup ===
echo.

echo 1. Git is already installed, checking PATH...
where git >nul 2>&1
if %errorlevel% neq 0 (
    echo Git not found in PATH, adding to PATH...
    set PATH=%PATH%;C:\Program Files\Git\cmd;C:\Program Files (x86)\Git\cmd
    where git >nul 2>&1
    if %errorlevel% neq 0 (
        echo ERROR: Git not found. Please install Git manually.
        pause
        exit /b 1
    )
)
echo Git found successfully!

echo.
echo 2. Initializing Git repository...
git init

echo.
echo 3. Adding remote repository...
git remote add origin https://github.com/classic1990/effective-journey.git

echo.
echo 4. Adding files to Git...
git add .

echo.
echo 5. Initial commit...
git commit -m "Initial commit: 25-HD Movie Streaming Website

Features:
- Movie streaming website with Firestore database
- YouTube video integration
- Search functionality
- Responsive design
- Admin panel (Blaze Plan required)
- AI Import feature (Blaze Plan required)

Security:
- API keys in .env (never committed)
- Comprehensive .gitignore
- Environment variables protection

Tech Stack:
- Firebase Hosting
- Firestore Database
- Vanilla JavaScript
- CSS3
- YouTube API integration"

echo.
echo 6. Pushing to GitHub...
git branch -M main
git push -u origin main

echo.
echo === Setup Complete! ===
echo.
echo Repository: https://github.com/classic1990/effective-journey
echo Live site: https://classic-e8ab7.web.app
echo.
echo Next steps for other developers:
echo 1. Clone: git clone https://github.com/classic1990/effective-journey.git
echo 2. Setup: cp functions/.env.example functions/.env
echo 3. Add your API keys to functions/.env
echo 4. Deploy: firebase deploy --only hosting
echo.
pause
