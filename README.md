 # Amazon Product Scraper

A full-stack application that scrapes Amazon product search results and displays them in a responsive frontend. Built with TypeScript, Node.js, and Vite.

## Features

- Real-time Amazon product search
- Responsive frontend with modern UI
- Rate limiting protection (10 requests per minute)
- Error handling and user feedback
- Support for different product layouts (electronics and consumables)
- Detailed product information including:
  - Product title
  - Rating (out of 5)
  - Number of reviews
  - Product image

## Prerequisites

- [Bun](https://bun.sh/) (v1.2.5 or higher)
- [ScrapeOps](https://scrapeops.io/) API key (for Amazon scraping)

## Project Structure

```
.
├── backend/                 # Backend Node.js/TypeScript application
│   ├── src/
│   │   ├── application/    # Application logic and interfaces
│   │   ├── domain/        # Domain entities and models
│   │   ├── infrastructure/# External services and implementations
│   │   └── interfaces/    # HTTP controllers and routes
│   └── package.json
├── frontend/              # Frontend Vite application
│   ├── src/
│   │   ├── main.js       # Main application entry point
│   │   └── style.css     # Global styles
│   └── package.json
└── README.md
```

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd amazon-product-scraper
```

2. Set up the backend:
```bash
cd backend
bun install
```

3. Create a `.env` file in the backend directory:
```env
SCRAPEOPS_API_KEY=your_api_key_here
PORT=3001
```

4. Set up the frontend:
```bash
cd ../frontend
bun install
```

## Running the Application

1. Start the backend server:
```bash
cd backend
bun run dev
```
The backend will run on http://localhost:3001

2. In a new terminal, start the frontend development server:
```bash
cd frontend
bun run dev
```
The frontend will run on http://localhost:5173

3. Open your browser and navigate to http://localhost:5173

## Rate Limiting

The application implements rate limiting to prevent abuse:
- Maximum 10 requests per minute
- Warning threshold at 5 remaining requests
- Visual feedback for rate limit status
- Automatic request blocking when limit is reached

## Error Handling

The application handles various error scenarios:
- Network errors
- Rate limit exceeded
- Invalid search terms
- Missing product data
- API failures

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.