#!/bin/bash

# GuruTech Docker Cleanup Script

set -e

echo "🧹 Cleaning up GuruTech Docker resources..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔄 Stopping all GuruTech containers...${NC}"
docker-compose down 2>/dev/null || true
docker-compose -f docker-compose.yml -f docker-compose.dev.yml down 2>/dev/null || true

echo -e "${BLUE}🗑️  Removing GuruTech containers...${NC}"
docker rm -f gurutech-app gurutech-dev 2>/dev/null || true

echo -e "${BLUE}🗑️  Removing GuruTech images...${NC}"
docker rmi gurutech:latest 2>/dev/null || true
docker rmi $(docker images | grep gurutech | awk '{print $3}') 2>/dev/null || true

echo -e "${BLUE}🗑️  Removing unused Docker resources...${NC}"
docker system prune -f

echo -e "${GREEN}✅ Cleanup completed!${NC}"

echo -e "${YELLOW}📋 To rebuild and start fresh:${NC}"
echo -e "${YELLOW}   ./scripts/docker-deploy.sh${NC}"