import type { Product } from '../entities/Product';
import type { IScraper } from '../../application/interfaces/IScraper';

export class ScrapeProducts {
    constructor(private readonly scraper: IScraper) {}

    async execute(keyword: string): Promise<Product[]> {
        if (!keyword) {
            throw new Error('Keyword is required');
        }
        return this.scraper.scrapeSearchPage(keyword);
    }
} 