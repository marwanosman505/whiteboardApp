# Use a lightweight base image
FROM nginx:latest

# Set working directory to /app
#WORKDIR /app

# Copy the index.html file to the nginx default directory
COPY WhiteBoard.html WhiteBoard.js WhiteBoard.css /user/share/nginx/html/

# Expose port 80 for HTTP traffic
EXPOSE 80

# Start the nginx server
CMD ["nginx", "-g", "daemon off;"]
