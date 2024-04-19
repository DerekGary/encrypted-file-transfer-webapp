#!/bin/bash

# Stop on error
set -e

# Sync files first
echo "Syncing files to EC2 instance..."
../sync_files.sh

echo "Building and deploying on EC2 instance..."
ssh -i ./ssh/django-react-ec2.pem ec2-user@18.116.13.2 << 'EOF'
set -e
source ~/.bash_profile

cd ./encrypted-file-transfer

# Build the frontend
echo "Building frontend..."
cd frontend
npm install
npm run build

# Navigate back to the project root
cd ..

# Run Docker compose for development
echo "Running Docker containers..."
docker-compose -f docker-compose.dev.yml up --build 2>&1 || echo "Docker compose failed to start"

EOF
