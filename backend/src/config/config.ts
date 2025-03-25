export const config = {
    port: process.env.PORT || 3001,
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:136.0) Gecko/20100101 Firefox/136.0',
    allowedOrigins: ['http://localhost:3000'],
    // Add Amazon-specific configurations
    amazonBaseUrl: 'https://www.amazon.com',
    scrapeOpsApiKey: process.env.SCRAPEOPS_API_KEY || '',
    // Add any API keys or secrets here (consider using environment variables)
    apiKeys: {
      // your API keys if needed
    },
    // Scraping configurations
    scrapingConfig: {
      timeout: 10000, // 10 seconds
      retries: 3,
    }
  };