import type { Request, Response } from 'express';
import { ScrapeProducts } from '../../../domain/use-cases/ScrapeProducts';
import { AmazonScraper } from '../../../infrastructure/services/AmazonScraper';

export class SearchController {
    private readonly scrapeProducts: ScrapeProducts;

    constructor() {
        console.log('Initializing SearchController');
        const scraper = new AmazonScraper();
        this.scrapeProducts = new ScrapeProducts(scraper);
    }

    async scrape(req: Request, res: Response): Promise<void> {
        const keyword = req.query.keyword as string;
        console.log('Received scrape request for keyword:', keyword);

        try {
            if (!keyword || keyword.trim().length === 0) {
                console.log('Missing keyword parameter');
                res.status(400).json({ 
                    error: 'Keyword query parameter is required',
                    code: 'MISSING_KEYWORD'
                });
                return;
            }

            console.log('Starting scrape process for:', keyword);
            const products = await this.scrapeProducts.execute(keyword.trim());
            
            console.log(`Scraping completed. Found ${products.length} products`);
            res.status(200).json(products);
        } catch (error) {
            console.error('Scraping error:', error);
            
            // Determine the appropriate error response
            if (error instanceof Error) {
                if (error.message.includes('429') || error.message.includes('rate limit')) {
                    res.status(429).json({
                        error: 'Rate limit exceeded',
                        code: 'RATE_LIMIT_EXCEEDED',
                        details: error.message
                    });
                } else if (error.message.includes('timeout')) {
                    res.status(504).json({
                        error: 'Request timeout',
                        code: 'TIMEOUT',
                        details: error.message
                    });
                } else {
                    res.status(500).json({ 
                        error: 'Failed to scrape products',
                        code: 'SCRAPING_ERROR',
                        details: error.message
                    });
                }
            } else {
                res.status(500).json({ 
                    error: 'An unexpected error occurred',
                    code: 'UNKNOWN_ERROR'
                });
            }
        }
    }
} 