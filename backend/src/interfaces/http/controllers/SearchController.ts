import type { Request, Response } from 'express';
import { ScrapeProducts } from '../../../domain/use-cases/ScrapeProducts';
import { AmazonScraper } from '../../../infrastructure/services/AmazonScraper';

export class SearchController {
    private readonly scrapeProducts: ScrapeProducts;

    constructor() {
        const apiKey = process.env.SCRAPEOPS_API_KEY || '';
        const scraper = new AmazonScraper(apiKey);
        this.scrapeProducts = new ScrapeProducts(scraper);
    }

    async scrape(req: Request, res: Response): Promise<void> {
        try {
            const keyword = req.query.keyword as string;

            if (!keyword) {
                res.status(400).json({ error: 'Keyword query parameter is required' });
                return;
            }

            const products = await this.scrapeProducts.execute(keyword);
            res.status(200).json(products);
        } catch (error) {
            console.error('Scraping error:', error);
            res.status(500).json({ 
                error: 'Failed to scrape products',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
} 