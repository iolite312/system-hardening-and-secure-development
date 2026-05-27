# ---------- Build Stage ----------
FROM node:22-alpine AS builder

# Create app directory
WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build Nuxt application
RUN npm run build

# ---------- Production Stage ----------
FROM node:22-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# Copy built output from builder
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package*.json ./

# Expose Nuxt port
EXPOSE 3000

# Start Nuxt server
CMD ["node", ".output/server/index.mjs"]