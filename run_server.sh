#!/bin/bash

# Set up logging
LOG_FILE="run_server.log"
exec > >(tee -a "$LOG_FILE") 2>&1

# Function to log messages with timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Stop on error
set -e

# Build the frontend locally
log "Building frontend locally..."
cd ./frontend/
npm install
npm run build
cd ..  # Return to the original directory

# Check if the build was successful
if [ $? -ne 0 ]; then
    log "Error: Frontend build failed. Aborting deployment."
    exit 1
fi

# Sync files, including the built frontend
log "Syncing files to EC2 instance..."
if ! ../sync_files.sh; then
    log "Error: File sync failed. Aborting deployment."
    exit 1
fi

log "Deploying on EC2 instance..."

# SSH into the EC2 instance and perform deployment steps
ssh -i ./ssh/django-react-ec2.pem ec2-user@3.21.248.87 << 'EOF'
set -e

# Load environment variables
source ~/.bash_profile

# Navigate to the project directory
cd ./encrypted-file-transfer

# Check if the Docker Compose file exists
if [ ! -f "docker-compose.dev.yml" ]; then
    echo "Error: Docker Compose file not found. Aborting deployment."
    exit 1
fi

# Run Docker Compose for development
echo "Stopping and removing existing Docker containers..."
docker-compose -f docker-compose.dev.yml down

echo "Building and starting Docker containers..."
docker-compose -f docker-compose.dev.yml up --build -d

# Wait a few seconds for containers to start
sleep 5

echo "Deployment completed successfully. Streaming Docker logs..."
# Tail Docker logs; adjust service names and duration as needed
docker-compose -f docker-compose.dev.yml logs -f
EOF

log "Server deployment completed."
