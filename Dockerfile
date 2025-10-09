
ARG NODE_VERSION=21.1.0

# Stage 1: Build the Vue.js frontend
FROM node:${NODE_VERSION}-alpine AS frontend-builder

# Set the working directory for the frontend
WORKDIR /app/frontend

# Copy package.json and package-lock.json
COPY frontend/package*.json ./

# Install frontend dependencies
RUN npm install

# Copy the rest of the frontend source code
COPY frontend/ ./

# Build the frontend for production
RUN npm run build


# Stage 2: Build the final image with the Fastify backend
FROM node:${NODE_VERSION}-alpine

# Set the working directory for the application
WORKDIR /app

# Copy backend's package files
COPY package*.json .

# Set workdir to backend to install dependencies
WORKDIR /app

# Install backend dependencies for production
RUN npm install --omit=dev

# Return to the app root
WORKDIR /app

# Copy the backend source code
COPY . .

# Copy the built frontend assets from the 'frontend-builder' stage
# This assumes your Fastify server will serve static files from a 'public' directory
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Expose the port your Fastify server is running on (e.g., 3000)
EXPOSE 3000

# The command to start your server
CMD ["node", "backend/index.js"]
