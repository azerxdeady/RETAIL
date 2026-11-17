# Karthik Jewellers & Viswanandini Retail Ecosystem - Production Container
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy application source code and assets
COPY . .

# Set default environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Expose server port
EXPOSE 5000

# Start unified retail ecosystem server
CMD ["node", "server.js"]
