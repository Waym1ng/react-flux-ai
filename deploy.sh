#!/bin/sh

# Define image and container names
IMAGE_NAME="react-flux-ai"
CONTAINER_NAME="react-flux-ai-app"

# Build the Docker image
echo "Building Docker image: $IMAGE_NAME"
docker build -t $IMAGE_NAME .

# Check if the build was successful
if [ $? -ne 0 ]; then
  echo "Docker image build failed!"
  exit 1
fi

# Stop and remove existing container if it's running
if docker ps -a --format '{{.Names}}' | grep -q $CONTAINER_NAME; then
  echo "Stopping existing container: $CONTAINER_NAME"
  docker stop $CONTAINER_NAME
  echo "Removing existing container: $CONTAINER_NAME"
  docker rm $CONTAINER_NAME
fi

# Run the new container
echo "Running new container: $CONTAINER_NAME"
docker run -d --name $CONTAINER_NAME -p 8009:80 $IMAGE_NAME

# Check if the container started successfully
if [ $? -ne 0 ]; then
  echo "Docker container failed to start!"
  exit 1
fi

echo "Deployment complete. The application should be accessible at http://localhost:8009"