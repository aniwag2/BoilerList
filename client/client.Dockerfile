# Stage 1: Build the React application
FROM node:20-alpine AS build

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the client application code
COPY . .

# Build the React app for production
# Ensure your build script in package.json is 'react-scripts build' or similar
RUN npm run build

# Stage 2: Serve the React application with Nginx
FROM nginx:stable-alpine

# Copy the built React app from the build stage to Nginx's html directory
COPY --from=build /app/build /usr/share/nginx/html

# Copy a custom Nginx configuration (optional, but good practice for SPAs)
# If you have specific Nginx configurations for routing, add them here.
# For a basic React app, the default Nginx config often works, but this is safer.
# If you create a custom nginx.conf, uncomment the line below and ensure the file exists.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80, which Nginx will listen on
EXPOSE 80

# The default command for Nginx is to start it, so we don't need a CMD instruction here.