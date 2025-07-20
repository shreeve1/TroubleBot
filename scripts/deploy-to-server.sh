#!/bin/bash
# TroubleBot AI Remote Deployment Script
# Usage: ./deploy-to-server.sh [server-ip] [username] [gemini-api-key]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check arguments
if [ $# -lt 3 ]; then
    log_error "Usage: $0 [server-ip] [username] [gemini-api-key]"
    log_info "Example: $0 192.168.1.100 ubuntu AIzaSyC0oODwV8iGrHaP7oDyAYGmWFTIGQ0iUbk"
    exit 1
fi

SERVER_IP="$1"
USERNAME="$2"
GEMINI_API_KEY="$3"
DEPLOY_PATH="/opt/troublebot-ai"

log_info "Starting TroubleBot AI deployment to $SERVER_IP..."

# Step 1: Create deployment archive
log_info "Creating deployment archive..."
tar -czf troublebot-ai-deploy.tar.gz \
    --exclude=node_modules \
    --exclude=.next \
    --exclude=.git \
    --exclude=logs \
    --exclude=troublebot-ai-deploy.tar.gz \
    .
log_success "Archive created: troublebot-ai-deploy.tar.gz"

# Step 2: Copy files to server
log_info "Copying files to server..."
scp troublebot-ai-deploy.tar.gz $USERNAME@$SERVER_IP:/tmp/
log_success "Files copied to server"

# Step 3: Deploy on server
log_info "Deploying on remote server..."
ssh $USERNAME@$SERVER_IP << EOF
set -e

# Create deployment directory
sudo mkdir -p $DEPLOY_PATH
cd $DEPLOY_PATH

# Stop existing containers if running
if [ -f docker-compose.yml ]; then
    echo "Stopping existing containers..."
    sudo docker-compose down || true
fi

# Extract new files
sudo rm -rf * || true
sudo tar -xzf /tmp/troublebot-ai-deploy.tar.gz
sudo chown -R \$USER:\$USER .

# Create production environment file
cat > .env << EOL
# TroubleBot AI Production Configuration
GEMINI_API_KEY=$GEMINI_API_KEY
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
PORT=3080
HOSTNAME=0.0.0.0
EOL

# Build and start containers
echo "Building Docker image..."
sudo docker-compose build --no-cache

echo "Starting containers..."
sudo docker-compose up -d

# Wait for health check
echo "Waiting for application to start..."
sleep 30

# Check if container is healthy
if sudo docker-compose ps | grep -q "Up.*healthy\\|Up"; then
    echo "✅ Deployment successful!"
    echo "🌐 TroubleBot AI is running at: http://\$(hostname -I | awk '{print \$1}'):3080"
    
    # Test API
    echo "Testing API..."
    if curl -s -f http://localhost:3080/api/hello-world > /dev/null; then
        echo "✅ API is responding"
    else
        echo "⚠️  API test failed, but container is running"
    fi
else
    echo "❌ Deployment failed!"
    sudo docker-compose logs troublebot-ai
    exit 1
fi

# Cleanup
rm -f /tmp/troublebot-ai-deploy.tar.gz
EOF

# Cleanup local files
rm -f troublebot-ai-deploy.tar.gz

log_success "Deployment completed!"
log_info "Your TroubleBot AI is now running at: http://$SERVER_IP:3080"
log_warning "Remember to configure your firewall to allow port 3080"
log_info "To check logs: ssh $USERNAME@$SERVER_IP 'cd $DEPLOY_PATH && sudo docker-compose logs -f troublebot-ai'"