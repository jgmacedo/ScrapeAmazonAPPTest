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

# Build the application
RUN bun run build

# Expose port
EXPOSE 5173

# Start the development server
CMD ["bun", "run", "dev", "--", "--host"] 