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

# Create .env file from example
COPY .env.example .env

# Expose port
EXPOSE 3001

# Start the application
CMD ["bun", "run", "dev"] 