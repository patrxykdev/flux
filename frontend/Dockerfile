# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package files first
COPY package*.json ./

# Debug: List files to verify they were copied
RUN ls -la

# Install dependencies (using npm install instead of npm ci)
RUN npm install --omit=dev

# Copy source code
COPY . .

# Debug: List files after copying
RUN ls -la

# Build the app
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built app from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY --from=build /app/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
