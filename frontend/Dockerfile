# Use Bun
FROM oven/bun:1

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN bun install

# Copy source code
COPY . .

# Expose port
EXPOSE 5173

# Start the application
CMD ["bun", "run", "dev", "--host"]