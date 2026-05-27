# === Stage 1: Build the Application ===
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first to leverage Docker layer caching
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Copy the rest of the application source code
COPY . .

# Build the production assets (defaults to outputting to the 'dist' folder)
RUN npm run build

# === Stage 2: Serve with Nginx ===
FROM nginx:alpine

# Copy the built static files from Stage 1 to Nginx's public folder
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80 for the web server
EXPOSE 80

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]