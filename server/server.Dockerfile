# Use the official Node.js 20 Alpine image as the base
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
# This helps Docker cache layers efficiently if dependencies don't change
COPY package*.json ./

# Install server dependencies
RUN npm install

# Copy the rest of the server application code
COPY . .

# Expose the port your Node.js server listens on (e.g., 5000 or 3000)
# Check your server/app.js to confirm the port. Let's assume 5000 for now.
EXPOSE 8080

# Command to run your Node.js server
# Ensure your package.json has a "start" script, e.g., "node app.js"
CMD ["npm", "start"]