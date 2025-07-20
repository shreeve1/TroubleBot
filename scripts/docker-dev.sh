#!/bin/bash

# GuruTech Docker Development Script with Hot Reloading

set -e

echo "🛠️  Starting GuruTech Development Environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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
        sed -i.bak 's/NODE_ENV=production/NODE_ENV=development/' .env
        echo -e "${YELLOW}📝 Please edit .env file and add your actual GEMINI_API_KEY${NC}"
    fi
fi

echo -e "${BLUE}🔄 Stopping existing containers...${NC}"
docker-compose -f docker-compose.yml -f docker-compose.dev.yml down 2>/dev/null || true

echo -e "${BLUE}📦 Building development image...${NC}"
docker-compose -f docker-compose.yml -f docker-compose.dev.yml build

echo -e "${BLUE}🚀 Starting development environment with hot reloading...${NC}"
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

echo -e "${GREEN}✅ Development environment is starting...${NC}"
echo -e "${BLUE}📍 Application will be available at: http://localhost:3080${NC}"
echo -e "${BLUE}🔥 Hot reloading is enabled - changes will be reflected automatically${NC}"

echo -e "${YELLOW}📋 To view logs: docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs -f${NC}"
echo -e "${YELLOW}⏹️  To stop: docker-compose -f docker-compose.yml -f docker-compose.dev.yml down${NC}"