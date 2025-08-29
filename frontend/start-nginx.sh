#!/bin/bash

# Set default backend URL if not provided
export BACKEND_URL=${BACKEND_URL:-"http://fluxtrader.xyz:8000"}

echo "Starting nginx with backend URL: $BACKEND_URL"

# Substitute environment variables in nginx config
envsubst '${BACKEND_URL}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

# Start nginx
exec nginx -g "daemon off;"
