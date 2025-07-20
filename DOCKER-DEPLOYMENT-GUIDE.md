# TroubleBot AI Remote Docker Deployment Guide

This guide covers multiple methods to deploy TroubleBot AI to a remote Docker server.

## Prerequisites

### Local Requirements
- Git repository with your code
- Docker and Docker Compose installed locally
- SSH access to your remote server

### Remote Server Requirements
- Ubuntu/CentOS/Debian Linux server
- Docker Engine installed
- Docker Compose installed
- SSH access (root or sudo user)
- Minimum 2GB RAM, 1 CPU core
- 10GB free disk space

## Method 1: Direct File Transfer + Build on Server

### Step 1: Prepare Your Code
```bash
# On your local machine
cd /path/to/TroubleBot-AI
git add .
git commit -m "Prepare for deployment"

# Create deployment archive
tar -czf troublebot-ai.tar.gz \
  --exclude=node_modules \
  --exclude=.next \
  --exclude=.git \
  --exclude=logs \
  .
```

### Step 2: Transfer Files to Server
```bash
# Replace with your server details
SERVER_USER="your-username"
SERVER_IP="your-server-ip"
DEPLOY_PATH="/opt/troublebot-ai"

# Copy files to server
scp troublebot-ai.tar.gz $SERVER_USER@$SERVER_IP:/tmp/

# SSH into server and extract
ssh $SERVER_USER@$SERVER_IP
sudo mkdir -p $DEPLOY_PATH
cd $DEPLOY_PATH
sudo tar -xzf /tmp/troublebot-ai.tar.gz
sudo chown -R $USER:$USER .
```

### Step 3: Configure Environment
```bash
# On the remote server
cd /opt/troublebot-ai

# Create production environment file
sudo tee .env.production << EOF
# TroubleBot AI Production Configuration
GEMINI_API_KEY=your_actual_gemini_api_key_here
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
PORT=3000
HOSTNAME=0.0.0.0
EOF

# Copy to the expected location
cp .env.production .env
```

### Step 4: Deploy with Docker Compose
```bash
# Build and start the application
sudo docker-compose build
sudo docker-compose up -d

# Check status
sudo docker-compose ps
sudo docker-compose logs troublebot-ai
```

## Method 2: Docker Registry Deployment

### Step 1: Build and Push to Registry
```bash
# On your local machine
cd /path/to/TroubleBot-AI

# Build for production
docker build -t troublebot-ai:latest .

# Tag for registry (replace with your registry)
docker tag troublebot-ai:latest your-registry.com/troublebot-ai:latest

# Push to registry
docker push your-registry.com/troublebot-ai:latest
```

### Step 2: Deploy from Registry
```bash
# On remote server
mkdir -p /opt/troublebot-ai
cd /opt/troublebot-ai

# Create docker-compose.yml for registry deployment
cat > docker-compose.yml << EOF
version: '3.8'

services:
  troublebot-ai:
    image: your-registry.com/troublebot-ai:latest
    container_name: troublebot-ai-app
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - GEMINI_API_KEY=\${GEMINI_API_KEY}
      - NEXT_TELEMETRY_DISABLED=1
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/api/hello-world"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    networks:
      - troublebot-ai-network

networks:
  troublebot-ai-network:
    driver: bridge
EOF

# Create environment file
echo "GEMINI_API_KEY=your_actual_gemini_api_key_here" > .env

# Pull and start
docker-compose pull
docker-compose up -d
```

## Method 3: Git-Based Deployment

### Step 1: Setup Git Repository Access
```bash
# On remote server
cd /opt
sudo git clone https://github.com/your-username/troublebot-ai.git
cd troublebot-ai
sudo chown -R $USER:$USER .
```

### Step 2: Deploy Script
```bash
# Create deployment script
cat > deploy.sh << EOF
#!/bin/bash
set -e

echo "🚀 Deploying TroubleBot AI..."

# Pull latest changes
git pull origin main

# Stop existing containers
docker-compose down

# Build and start
docker-compose build --no-cache
docker-compose up -d

# Wait for health check
echo "⏳ Waiting for health check..."
sleep 30

# Check status
if docker-compose ps | grep -q "Up.*healthy"; then
    echo "✅ TroubleBot AI deployed successfully!"
    echo "🌐 Application available at: http://$(hostname -I | awk '{print $1}'):3000"
else
    echo "❌ Deployment failed. Checking logs:"
    docker-compose logs troublebot-ai
    exit 1
fi
EOF

chmod +x deploy.sh
```

### Step 3: Run Deployment
```bash
# Set your API key
export GEMINI_API_KEY="your_actual_gemini_api_key_here"
echo "GEMINI_API_KEY=$GEMINI_API_KEY" > .env

# Deploy
./deploy.sh
```

## Production Considerations

### 1. Reverse Proxy Setup (Recommended)
```bash
# Install Nginx
sudo apt update
sudo apt install nginx

# Create Nginx configuration
sudo tee /etc/nginx/sites-available/troublebot-ai << EOF
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/troublebot-ai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 2. SSL Certificate with Let's Encrypt
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com
```

### 3. Firewall Configuration
```bash
# Configure UFW firewall
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
```

### 4. Monitoring and Logging
```bash
# View application logs
docker-compose logs -f troublebot-ai

# Monitor container resource usage
docker stats troublebot-ai-app

# Set up log rotation
sudo tee /etc/docker/daemon.json << EOF
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
EOF

sudo systemctl restart docker
```

### 5. Backup Strategy
```bash
# Create backup script
cat > backup.sh << EOF
#!/bin/bash
BACKUP_DIR="/opt/backups/troublebot-ai"
DATE=\$(date +%Y%m%d_%H%M%S)

mkdir -p \$BACKUP_DIR

# Backup application data and configuration
tar -czf \$BACKUP_DIR/troublebot-ai_\$DATE.tar.gz \
  /opt/troublebot-ai \
  --exclude=/opt/troublebot-ai/node_modules

# Keep only last 7 backups
find \$BACKUP_DIR -name "troublebot-ai_*.tar.gz" -mtime +7 -delete

echo "Backup completed: \$BACKUP_DIR/troublebot-ai_\$DATE.tar.gz"
EOF

chmod +x backup.sh

# Add to crontab for daily backups
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/troublebot-ai/backup.sh") | crontab -
```

## Troubleshooting

### Common Issues

1. **Container won't start**
   ```bash
   # Check logs
   docker-compose logs troublebot-ai
   
   # Check system resources
   df -h
   free -m
   ```

2. **API Key issues**
   ```bash
   # Verify environment variables
   docker-compose exec troublebot-ai env | grep GEMINI
   ```

3. **Port conflicts**
   ```bash
   # Check what's using port 3000
   sudo netstat -tulpn | grep :3000
   
   # Use different port if needed
   # Edit docker-compose.yml: "3001:3000"
   ```

4. **Permission issues**
   ```bash
   # Fix ownership
   sudo chown -R $USER:$USER /opt/troublebot-ai
   ```

### Health Checks
```bash
# Test API endpoints
curl -s http://localhost:3000/api/hello-world
curl -s http://localhost:3000/api/echo -X POST -H "Content-Type: application/json" -d '{"message":"test"}'

# Test web interface
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/
```

## Security Best Practices

1. **Environment Variables**: Never commit API keys to Git
2. **User Permissions**: Run containers as non-root user
3. **Network Security**: Use Docker networks and firewall rules
4. **Regular Updates**: Keep Docker and base images updated
5. **Monitoring**: Set up log monitoring and alerting

## Maintenance

### Updates
```bash
# Pull latest code
cd /opt/troublebot-ai
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Resource Monitoring
```bash
# Check Docker system usage
docker system df

# Clean up unused resources
docker system prune -a --volumes
```

---

**Need Help?** Check the troubleshooting section or review application logs for specific error messages.