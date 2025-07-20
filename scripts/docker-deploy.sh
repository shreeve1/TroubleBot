#!/bin/bash

# GuruTech Docker Deployment Script

set -e

echo "🚀 Starting GuruTech Docker Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker and try again.${NC}"
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  No .env file found. Creating from template...${NC}"
    if [ -f .env.docker ]; then
        cp .env.docker .env
        echo -e "${YELLOW}📝 Please edit .env file and add your actual GEMINI_API_KEY${NC}"
        echo -e "${YELLOW}📝 Current .env file:${NC}"
        cat .env
        echo ""
        read -p "Press Enter to continue after updating .env file..."
    else
        echo -e "${RED}❌ .env.docker template not found. Please create .env file manually.${NC}"
        exit 1
    fi
fi

# Validate GEMINI_API_KEY
source .env
if [ -z "$GEMINI_API_KEY" ] || [ "$GEMINI_API_KEY" = "your_actual_gemini_api_key_here" ]; then
    echo -e "${RED}❌ Please set a valid GEMINI_API_KEY in .env file${NC}"
    exit 1
fi

echo -e "${BLUE}📦 Building Docker image...${NC}"
docker build -t gurutech:latest .

echo -e "${BLUE}🔄 Stopping existing container (if any)...${NC}"
docker-compose down 2>/dev/null || true

echo -e "${BLUE}🚀 Starting GuruTech application...${NC}"
docker-compose up -d

echo -e "${GREEN}✅ GuruTech is starting up...${NC}"
echo -e "${BLUE}📍 Application will be available at: http://localhost:3080${NC}"
echo -e "${BLUE}🔍 API health check: http://localhost:3080/api/hello-world${NC}"

echo -e "${YELLOW}📋 Waiting for application to be ready...${NC}"
sleep 10

# Health check
echo -e "${BLUE}🏥 Performing health check...${NC}"
for i in {1..30}; do
    if curl -f -s http://localhost:3080/api/hello-world > /dev/null; then
        echo -e "${GREEN}✅ Application is healthy and ready!${NC}"
        echo ""
        echo -e "${GREEN}🎉 GuruTech is now running locally in Docker!${NC}"
        echo -e "${BLUE}📱 Open your browser and visit: http://localhost:3080${NC}"
        echo ""
        echo -e "${YELLOW}📊 To view logs: docker-compose logs -f${NC}"
        echo -e "${YELLOW}⏹️  To stop: docker-compose down${NC}"
        echo -e "${YELLOW}🔄 To restart: docker-compose restart${NC}"
        exit 0
    fi
    echo -n "."
    sleep 2
done

echo -e "${RED}❌ Health check failed. Application may not be ready.${NC}"
echo -e "${YELLOW}📋 Check logs with: docker-compose logs${NC}"
exit 1