# syntax = docker/dockerfile:1

# Adjust NODE_VERSION as desired
ARG NODE_VERSION=20.18.0
FROM node:${NODE_VERSION}-slim as base

LABEL fly_launch_runtime="Node.js"

# Node.js app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV="production"

# Install packages needed to build node modules
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential node-gyp pkg-config python-is-python3 && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

# Copy package.json
COPY package-lock.json package.json ./

# Install node modules
RUN npm ci --include=dev --legacy-peer-deps

# Copy application code
COPY . .

# Build application
RUN npm run build:full

# Final stage for app image
FROM node:${NODE_VERSION}-slim

# Set production environment
ENV NODE_ENV="production"

WORKDIR /app

# Copy built application
COPY --from=0 /app/dist /app/dist
COPY --from=0 /app/node_modules /app/node_modules
COPY --from=0 /app/package.json /app/package.json

# Create nodejs user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

# Set ownership
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 8080

# Start the server
CMD ["node", "dist/server/index.js"]
