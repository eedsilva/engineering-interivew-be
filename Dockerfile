# Stage 1: Build the application
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install --ignore-scripts

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build the TypeScript source
RUN npm run build

# Stage 2: Create the production image
FROM node:20-alpine

WORKDIR /usr/src/app

# Copy production dependencies
COPY package*.json ./
RUN npm install --omit=dev --ignore-scripts

# Copy built application from the builder stage
COPY --from=builder /usr/src/app/dist ./dist

# Copy Prisma schema
COPY --from=builder /usr/src/app/prisma ./prisma

# Copy the generated Prisma Client
COPY --from=builder /usr/src/app/node_modules/.prisma/client ./node_modules/.prisma/client

# Copy static assets
COPY --from=builder /usr/src/app/public ./public

# Expose the port
EXPOSE 3000

# The command to run the application
CMD ["node", "dist/index.js"]
