# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package files explicitly
COPY package.json package-lock.json ./

# Verify files are copied and install dependencies
RUN ls -la && npm ci

# Copy source code
COPY . .

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
