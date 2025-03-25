# Amazon Product Scraper

A full-stack application for scraping Amazon product search results. Built with Bun, Express, and Vite.

## Features

- Real-time product search
- Responsive frontend design
- Rate limiting and error handling
- Detailed product information including:
  - Product title
  - Rating
  - Review count
  - Product image

## Prerequisites

- [Bun](https://bun.sh/) (v1.2.5 or higher)
- A ScrapeOps API key (for Amazon scraping)

## Project Structure

```
.
├── backend/           # Express.js backend
│   ├── src/          # Source code
│   ├── .env.example  # Example environment variables
│   └── package.json  # Backend dependencies
└── frontend/         # Vite.js frontend
    ├── src/          # Source code
    └── package.json  # Frontend dependencies
```

## Setup

### Option 1: Manual Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd amazon-product-scraper
   ```

2. Create a `.env` file in the root directory:
   ```bash
   cp backend/.env.example .env
   # Edit .env and add your ScrapeOps API key
   ```

3. Set up the backend:
   ```bash
   cd backend
   bun install
   ```

4. Set up the frontend:
   ```bash
   cd ../frontend
   bun install
   ```

### Option 2: Docker Setup (Recommended)

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd amazon-product-scraper
   ```

2. Create a `.env` file in the root directory:
   ```bash
   cp backend/.env.example .env
   # Edit .env and add your ScrapeOps API key
   ```

3. Build and run with Docker Compose:
   ```bash
   docker-compose up --build
   ```

## Running the Application

### Manual Setup

1. Start the backend server:
   ```bash
   cd backend
   bun run dev
   ```

2. In a new terminal, start the frontend development server:
   ```bash
   cd frontend
   bun run dev
   ```

3. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

### Docker Setup

1. Start all services:
   ```bash
   docker-compose up
   ```

2. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

3. To stop the services:
   ```bash
   docker-compose down
   ```

## Rate Limiting

The application implements rate limiting to prevent excessive API calls:
- Maximum 60 requests per minute
- Rate limit headers are included in responses
- Frontend displays remaining requests and reset time

## Error Handling

The application includes comprehensive error handling:
- Network errors
- Rate limit exceeded
- Invalid search terms
- Missing API key
- Server errors

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.