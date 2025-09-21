@echo off
REM A script to start both the frontend and backend servers in separate windows.

echo Starting Bhrashtachar Mukt application...

echo Starting Frontend server in a new window...
start "Bhrashtachar Mukt - Frontend" cmd /k "cd frontend && npm start"

echo Starting Backend server in a new window...
start "Bhrashtachar Mukt - Backend" cmd /k "cd backend && npm start"