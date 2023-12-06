# Use a lightweight base image
FROM nginx:alpine

# Set working directory to /app
#WORKDIR /app

# Copy the index.html file to the nginx default directory
COPY index.html /usr/share/nginx/html/

# Expose port 80 for HTTP traffic
EXPOSE 80

# Start the nginx server
CMD ["nginx", "-g", "daemon off;"]
