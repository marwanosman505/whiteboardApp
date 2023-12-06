#!/bin/bash

# Validate the number of arguments
if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <name>"
    exit 1
fi

# Assign command-line argument to the name variable
name=$1
repo_name="${name}repo"

# Navigate to the directory containing Dockerfile
#cd ~/Programs/whiteboardapp/dockerWebImage

# Build Docker image
image_name="${name}-image"
sudo docker build -t "$image_name" .

# Tag Docker image
sudo docker tag "$image_name" defpro101/"$repo_name"

# Display Docker images
sudo docker images

# Push Docker image to the repository
sudo docker push defpro101/"$repo_name"

# Create Kubernetes deployment
deployment_name="${name}-deployment"
sudo microk8s kubectl create deployment "$deployment_name" --image defpro101/"$repo_name"

# Get all resources in all namespaces
sudo microk8s kubectl get all --all-namespaces

# Expose deployment as a NodePort service
service_name="${name}-service"
sudo microk8s kubectl expose deployment "$deployment_name" --type=NodePort --port=86 --name="$service_name"

# Get all resources in all namespaces after exposing the service
sudo microk8s kubectl get all --all-namespaces
