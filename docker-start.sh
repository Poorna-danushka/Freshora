#!/bin/bash
# Docker Quick Start Script for Freshora (Bash)
# This script helps you quickly set up and run the Freshora application with Docker

echo "🚀 Freshora Docker Setup"
echo "========================"
echo ""

# Check if Docker is running
echo "Checking Docker..."
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop."
    exit 1
fi
echo "✅ Docker is running"
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚙️  Creating .env file from .env.example..."
    cp .env.example .env
    echo "✅ .env file created"
    echo ""
    echo "⚠️  IMPORTANT: Please edit .env file and set:"
    echo "   - Strong passwords for MYSQL_PASSWORD and MYSQL_ROOT_PASSWORD"
    echo "   - A secure JWT secret (minimum 32 characters) for FRESHORA_JWT_SECRET"
    echo ""

    read -p "Have you configured the .env file? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Please configure .env file and run this script again."
        exit 0
    fi
else
    echo "✅ .env file exists"
    echo ""
fi

# Build and start services
echo "🏗️  Building and starting Docker containers..."
echo "This may take a few minutes on first run..."
echo ""

docker compose up -d --build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ All services started successfully!"
    echo ""
    echo "🌐 Access your application:"
    echo "   Frontend:  http://localhost:3000"
    echo "   Backend:   http://localhost:8080"
    echo "   Health:    http://localhost:8080/actuator/health/readiness"
    echo ""
    echo "📊 Useful commands:"
    echo "   View logs:        docker compose logs -f"
    echo "   Stop services:    docker compose down"
    echo "   Restart:          docker compose restart"
    echo ""
    echo "⏳ Services are starting up, please wait 30-60 seconds for backend to be fully ready."
else
    echo ""
    echo "❌ Failed to start services. Check the error messages above."
    echo "Run 'docker compose logs' to see detailed logs."
    exit 1
fi
