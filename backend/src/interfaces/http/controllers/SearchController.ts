import type { Request, Response } from 'express';
import { AmazonScraper } from '../../../infrastructure/services/AmazonScraper';

/**
 * SearchController handles HTTP requests for product searches.
 * It uses the AmazonScraper service to fetch and return product data.
 */
export class SearchController {
    private scraper: AmazonScraper;

    constructor() {
        console.log('Initializing SearchController');
        this.scraper = new AmazonScraper();
    }

    /**
     * Handles GET requests to /api/scrape endpoint.
     * Expects a 'keyword' query parameter for the search term.
     * Returns a JSON array of products or an error response.
     */
    async scrape(req: Request, res: Response): Promise<void> {
        try {
            const { keyword } = req.query;
            console.log('Received search request for keyword:', keyword);

            // Validate required parameters
            if (!keyword || typeof keyword !== 'string') {
                console.log('Missing or invalid keyword parameter');
                res.status(400).json({
                    error: 'Missing or invalid keyword parameter',
                    details: 'Please provide a valid search keyword'
                });
                return;
            }

            // Scrape products from Amazon
            console.log('Starting product scraping...');
            const products = await this.scraper.scrapeSearchPage(keyword);
            console.log(`Successfully scraped ${products.length} products`);

            // Return results
            res.json(products);
        } catch (error) {
            console.error('Error in scrape endpoint:', error instanceof Error ? error.message : 'Unknown error');

            // Handle specific error cases
            if (error instanceof Error) {
                if (error.message.includes('rate limit')) {
                    res.status(429).json({
                        error: 'Rate limit exceeded',
                        details: 'Please try again in a few minutes'
                    });
                } else if (error.message.includes('timeout')) {
                    res.status(504).json({
                        error: 'Request timeout',
                        details: 'The request took too long to complete'
                    });
                } else {
                    res.status(500).json({
                        error: 'Internal server error',
                        details: error.message
                    });
                }
            } else {
                res.status(500).json({
                    error: 'Internal server error',
                    details: 'An unexpected error occurred'
                });
            }
        }
    }
} 