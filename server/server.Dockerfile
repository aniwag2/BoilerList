# glibc-based image: onnxruntime-node (via @chroma-core/default-embed) ships a glibc
# native binary that cannot load on Alpine/musl.
FROM node:20-slim

# libgomp1 is the OpenMP runtime onnxruntime-node links against.
RUN apt-get update \
    && apt-get install -y --no-install-recommends libgomp1 \
    && rm -rf /var/lib/apt/lists/*

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