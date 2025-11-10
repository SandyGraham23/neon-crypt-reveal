# PowerShell script to restart Hardhat node
# This script kills any existing Hardhat node processes and restarts it

Write-Host "Stopping existing Hardhat node processes..." -ForegroundColor Yellow

# Find and kill processes using port 8545
$processes = Get-NetTCPConnection -LocalPort 8545 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique

if ($processes) {
    foreach ($pid in $processes) {
        try {
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            Write-Host "Killed process $pid" -ForegroundColor Green
        } catch {
            Write-Host "Could not kill process $pid" -ForegroundColor Red
        }
    }
    Start-Sleep -Seconds 2
} else {
    Write-Host "No processes found on port 8545" -ForegroundColor Yellow
}

Write-Host "`nStarting Hardhat node..." -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop the node`n" -ForegroundColor Cyan

# Change to project directory and start Hardhat node
Set-Location $PSScriptRoot
npx hardhat node

