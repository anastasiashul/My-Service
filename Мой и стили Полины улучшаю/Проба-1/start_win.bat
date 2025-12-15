@echo off
cd backend
start /B python app.py
cd ..
timeout /t 2 /nobreak
start frontend\index.html
pause