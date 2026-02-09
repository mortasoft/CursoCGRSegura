# dev.ps1 - Adaptation of dev.sh for Windows

Write-Host "Starting local development environment CGR LMS..." -ForegroundColor Blue
Write-Host "=================================================="

# 0. Clean up previous processes
Write-Host "Cleaning up previous processes and ports..." -ForegroundColor Yellow

function Kill-PortProcess {
    param([int]$Port)
    $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    foreach ($conn in $connections) {
        try {
            $process = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
            if ($process) {
                Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
                Write-Host "   - Killing process on port $Port (PID: $($process.Id))" -ForegroundColor Gray
            }
        }
        catch {}
    }
}

Kill-PortProcess -Port 5000
Kill-PortProcess -Port 3000
Kill-PortProcess -Port 3001

# Kill node/nodemon/vite processes
Get-Process -Name "node", "nodemon", "vite" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# Stop containers
docker compose stop frontend backend nginx 2>&1 | Out-Null

Write-Host "Cleanup completed." -ForegroundColor Green
Write-Host ""

# Global variable for backend process
$script:backendProcess = $null

function Cleanup-And-Exit {
    Write-Host ""
    Write-Host "Stopping services..." -ForegroundColor Red
    
    if ($script:backendProcess -and -not $script:backendProcess.HasExited) {
        Stop-Process -Id $script:backendProcess.Id -Force -ErrorAction SilentlyContinue
    }
    
    # Stop docker infrastructure
    docker compose stop mariadb redis
    
    Write-Host "All services stopped correctly." -ForegroundColor Green
}

# 1. Start infrastructure
Write-Host "Starting MariaDB and Redis in Docker..." -ForegroundColor Blue
docker compose up -d mariadb redis

# Wait for DB
Write-Host "Waiting for database to be ready..."
do {
    docker compose exec mariadb mariadb-admin ping -h localhost --silent 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Host -NoNewline "."
        Start-Sleep -Seconds 2
    }
} until ($LASTEXITCODE -eq 0)

Write-Host ""
Write-Host "Database ready." -ForegroundColor Green

# 2. Start Backend
Write-Host "Starting Backend (Port 5000)..." -ForegroundColor Blue

if (-not (Test-Path "backend\node_modules")) {
    Write-Host "Installing backend dependencies..."
    Push-Location backend
    npm install
    Pop-Location
}

# Start backend in a new window
$backendStartInfo = New-Object System.Diagnostics.ProcessStartInfo
$backendStartInfo.FileName = "powershell.exe"
# Using single quotes for the outer string and escaping inner quotes by doubling them
$backendStartInfo.Arguments = '-NoExit -Command "Set-Location backend; $env:DB_HOST=''localhost''; $env:REDIS_HOST=''localhost''; $env:NODE_ENV=''development''; npm run dev"'
$backendStartInfo.UseShellExecute = $true 
$script:backendProcess = [System.Diagnostics.Process]::Start($backendStartInfo)

# 3. Start Frontend
Write-Host "Starting Frontend (Port 3000)..." -ForegroundColor Blue

if (-not (Test-Path "frontend\node_modules")) {
    Write-Host "Installing frontend dependencies..."
    Push-Location frontend
    npm install --legacy-peer-deps
    Pop-Location
}

Write-Host "Development environment active." -ForegroundColor Green
Write-Host "   - Frontend: http://localhost:3000"
Write-Host "   - Backend:  http://localhost:5000"
Write-Host "   (Press Ctrl+C to stop everything)"
Write-Host ""

try {
    Push-Location frontend
    npm run dev
}
finally {
    Pop-Location
    Cleanup-And-Exit
}
