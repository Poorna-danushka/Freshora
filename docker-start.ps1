# Docker Quick Start Script for Freshora (PowerShell)
# This script helps you quickly set up and run the Freshora application with Docker

Write-Host "Freshora Docker Setup" -ForegroundColor Cyan
Write-Host "========================`n" -ForegroundColor Cyan

# Check if Docker is running
Write-Host "Checking Docker..." -ForegroundColor Yellow
try {
    docker info > $null 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Docker is not running. Please start Docker Desktop." -ForegroundColor Red
        exit 1
    }
    Write-Host "Docker is running.`n" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Docker is not installed or not running." -ForegroundColor Red
    exit 1
}

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host ".env file created.`n" -ForegroundColor Green
    Write-Host "IMPORTANT: Please edit .env file and set:" -ForegroundColor Yellow
    Write-Host "   - Strong passwords for MYSQL_PASSWORD and MYSQL_ROOT_PASSWORD" -ForegroundColor Yellow
    Write-Host "   - A secure JWT secret (minimum 32 characters) for FRESHORA_JWT_SECRET`n" -ForegroundColor Yellow

    $continue = Read-Host "Have you configured the .env file? (y/n)"
    if ($continue -ne "y") {
        Write-Host "Please configure .env file and run this script again." -ForegroundColor Yellow
        exit 0
    }
} else {
    Write-Host ".env file exists.`n" -ForegroundColor Green
}

# Build and start services
Write-Host "Building and starting Docker containers..." -ForegroundColor Yellow
Write-Host "This may take a few minutes on first run...`n" -ForegroundColor Yellow

docker compose up -d --build

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nAll services started successfully!`n" -ForegroundColor Green
    Write-Host "Access your application:" -ForegroundColor Cyan
    Write-Host "   Frontend:  http://localhost:3000" -ForegroundColor White
    Write-Host "   Backend:   http://localhost:8080" -ForegroundColor White
    Write-Host "   Health:    http://localhost:8080/actuator/health/readiness`n" -ForegroundColor White

    Write-Host "Useful commands:" -ForegroundColor Cyan
    Write-Host "   View logs:        docker compose logs -f" -ForegroundColor White
    Write-Host "   Stop services:    docker compose down" -ForegroundColor White
    Write-Host "   Restart:          docker compose restart`n" -ForegroundColor White

    Write-Host "Services are starting up. Please wait 30-60 seconds for the backend to be ready." -ForegroundColor Yellow
} else {
    Write-Host "`nERROR: Failed to start services. Check the error messages above." -ForegroundColor Red
    Write-Host "Run 'docker compose logs' to see detailed logs." -ForegroundColor Yellow
    exit 1
}
