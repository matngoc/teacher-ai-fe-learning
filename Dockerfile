# Build stage
FROM node:23-alpine AS builder

# Set working directory
WORKDIR /app

# Enable yarn
RUN corepack enable

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Accept build arguments for API URLs
ARG VITE_API_URL
ARG VITE_AI_BE_URL
ARG VITE_WS_BASE_URL

# Set environment variables for build
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_AI_BE_URL=$VITE_AI_BE_URL
ENV VITE_WS_BASE_URL=$VITE_WS_BASE_URL

# Build the application
RUN yarn build

# Production stage
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80 (nginx default)
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

