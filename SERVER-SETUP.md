# Server Setup Requirements for TroubleBot AI

## Minimum System Requirements

### Hardware
- **CPU**: 1 core (2 cores recommended for production)
- **RAM**: 2GB (4GB recommended for production)
- **Storage**: 10GB free space (20GB recommended)
- **Network**: Stable internet connection

### Operating System
- Ubuntu 20.04 LTS or newer
- CentOS 8 or newer
- Debian 11 or newer
- RHEL 8 or newer

## Pre-Installation Setup

### 1. Update System
```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# CentOS/RHEL
sudo dnf update -y
# or for older versions
sudo yum update -y
```

### 2. Install Docker Engine
```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# CentOS/RHEL
sudo dnf config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo dnf install docker-ce docker-ce-cli containerd.io
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER
```

### 3. Install Docker Compose
```bash
# Method 1: Docker Compose Plugin (Recommended)
sudo apt install docker-compose-plugin

# Method 2: Standalone Binary
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker compose version
# or
docker-compose version
```

### 4. Install Additional Tools
```bash
# Ubuntu/Debian
sudo apt install -y git curl wget unzip nginx ufw

# CentOS/RHEL
sudo dnf install -y git curl wget unzip nginx firewalld
```

### 5. Configure Firewall
```bash
# Ubuntu (UFW)
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp  # For direct access during setup
sudo ufw --force enable

# CentOS/RHEL (firewalld)
sudo systemctl start firewalld
sudo systemctl enable firewalld
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --reload
```

## User Setup

### 1. Create Deployment User (Optional but Recommended)
```bash
# Create dedicated user for TroubleBot AI
sudo useradd -m -s /bin/bash troublebot
sudo usermod -aG docker troublebot
sudo usermod -aG sudo troublebot

# Set password
sudo passwd troublebot

# Switch to user
sudo su - troublebot
```

### 2. SSH Key Setup
```bash
# On your local machine, copy your SSH key
ssh-copy-id troublebot@your-server-ip

# Or manually copy the key
# mkdir -p ~/.ssh
# echo "your-public-key-here" >> ~/.ssh/authorized_keys
# chmod 600 ~/.ssh/authorized_keys
# chmod 700 ~/.ssh
```

## Directory Structure Setup
```bash
# Create application directories
sudo mkdir -p /opt/troublebot-ai
sudo mkdir -p /opt/troublebot-ai/logs
sudo mkdir -p /opt/backups/troublebot-ai

# Set permissions
sudo chown -R troublebot:troublebot /opt/troublebot-ai
sudo chown -R troublebot:troublebot /opt/backups/troublebot-ai
```

## Environment Variables Setup

### 1. Get Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key
5. Keep it secure - you'll need it during deployment

### 2. System Environment (Optional)
```bash
# Add to ~/.bashrc or ~/.profile
echo 'export TROUBLEBOT_HOME="/opt/troublebot-ai"' >> ~/.bashrc
echo 'export TROUBLEBOT_USER="troublebot"' >> ~/.bashrc
source ~/.bashrc
```

## Security Hardening (Production)

### 1. SSH Configuration
```bash
# Edit SSH config
sudo nano /etc/ssh/sshd_config

# Recommended settings:
# PasswordAuthentication no
# PermitRootLogin no
# Port 2222  # Change default port
# AllowUsers troublebot

# Restart SSH service
sudo systemctl restart sshd
```

### 2. Fail2Ban Installation
```bash
# Ubuntu/Debian
sudo apt install fail2ban

# CentOS/RHEL
sudo dnf install epel-release
sudo dnf install fail2ban

# Start and enable
sudo systemctl start fail2ban
sudo systemctl enable fail2ban
```

### 3. Automatic Updates
```bash
# Ubuntu/Debian
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades

# CentOS/RHEL
sudo dnf install dnf-automatic
sudo systemctl enable --now dnf-automatic.timer
```

## Monitoring Setup (Optional)

### 1. Install System Monitoring
```bash
# Install htop and other monitoring tools
sudo apt install htop iotop nethogs ncdu

# For Docker monitoring
docker run -d \
  --name=netdata \
  -p 19999:19999 \
  -v netdataconfig:/etc/netdata \
  -v netdatalib:/var/lib/netdata \
  -v netdatacache:/var/cache/netdata \
  -v /etc/passwd:/host/etc/passwd:ro \
  -v /etc/group:/host/etc/group:ro \
  -v /proc:/host/proc:ro \
  -v /sys:/host/sys:ro \
  -v /etc/os-release:/host/etc/os-release:ro \
  --restart unless-stopped \
  --cap-add SYS_PTRACE \
  --security-opt apparmor=unconfined \
  netdata/netdata
```

### 2. Log Rotation
```bash
# Configure Docker log rotation
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

## Verification Checklist

Before deploying TroubleBot AI, verify:

- [ ] Docker is installed and running: `docker --version`
- [ ] Docker Compose is installed: `docker compose version`
- [ ] User can run Docker commands: `docker ps`
- [ ] Firewall is configured properly
- [ ] SSH access is working
- [ ] Directory structure is created
- [ ] You have a valid Gemini API key
- [ ] System has enough resources

## Troubleshooting Common Issues

### Docker Permission Issues
```bash
# Add user to docker group
sudo usermod -aG docker $USER
# Logout and login again
```

### Port Already in Use
```bash
# Check what's using port 3000
sudo netstat -tulpn | grep :3000
# Kill the process or use a different port
```

### Insufficient Disk Space
```bash
# Check disk usage
df -h
# Clean up Docker if needed
docker system prune -a --volumes
```

### Memory Issues
```bash
# Check memory usage
free -m
# Add swap if needed
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

---

**Next Steps**: Once your server meets these requirements, you can proceed with the deployment using the methods described in `DOCKER-DEPLOYMENT-GUIDE.md`.