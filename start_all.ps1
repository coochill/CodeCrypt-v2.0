<#
Start both backend and frontend development servers in separate PowerShell windows.

Usage (from repo root):
  .\start_all.ps1

This script opens two new PowerShell windows (so you can see logs and stop each one
independently). It starts the backend via `python waitress_runner.py` and the frontend
via `npm run dev` in the `frontend` folder.
#>

$root = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "Starting backend and frontend from: $root"

# Backend: open new powershell window and run waitress runner
Start-Process powershell -ArgumentList @('-NoExit','-Command', "Set-Location '$root\backend'; python waitress_runner.py") -WindowStyle Normal
Start-Sleep -Milliseconds 500

# Frontend: open new powershell window and run npm dev
Start-Process powershell -ArgumentList @('-NoExit','-Command', "Set-Location '$root\frontend'; npm run dev") -WindowStyle Normal

Write-Host "Launched backend and frontend. Check the two new PowerShell windows for logs." 
