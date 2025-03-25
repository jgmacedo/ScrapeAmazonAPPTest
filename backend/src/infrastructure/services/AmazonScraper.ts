import { JSDOM } from 'jsdom';
import axios from 'axios';
import type { IScraper } from '../../application/interfaces/IScraper';
import type { Product } from '../../domain/entities/Product';

export class AmazonScraper implements IScraper {
    constructor(private readonly apiKey: string) {}

    private getScrapeopsUrl(keyword: string): string {
        const params = new URLSearchParams({
            api_key: this.apiKey,
            url: `https://www.amazon.com/s?k=${keyword}&page=1`,
            country: 'us'
        });
        return `https://proxy.scrapeops.io/v1/?${params.toString()}`;
    }

    async scrapeSearchPage(keyword: string): Promise<Product[]> {
        try {
            const url = this.getScrapeopsUrl(keyword);
            const response = await axios.get(url);

            if (response.status !== 200) {
                throw new Error(`Failed to scrape page: ${response.status}`);
            }

            return this.parseSearchResults(response.data);
        } catch (error) {
            console.error('Scraping error:', error);
            throw new Error('Failed to scrape Amazon search page');
        }
    }

    private parseSearchResults(html: string): Product[] {
        const dom = new JSDOM(html);
        const document = dom.window.document;
        const products: Product[] = [];

        const productDivs = document.querySelectorAll('[data-asin]');
        productDivs.forEach(div => {
            // Extract title
            const titleElement = div.querySelector('h2.a-size-base-plus.a-spacing-none.a-color-base.a-text-normal span');
            const title = titleElement?.textContent?.trim() || '';

            // Extract rating
            const ratingElement = div.querySelector('.a-icon-star-small .a-icon-alt');
            const ratingText = ratingElement?.textContent?.substring(0, 3) || '0';
            const rating = parseFloat(ratingText);

            // Extract image URL
            const imageElement = div.querySelector('img.s-image');
            const imageUrl = imageElement?.getAttribute('src') || '';

            // Extract review count
            const reviewCountElement = div.querySelector('[data-cy="reviews-block"] .a-size-base.s-underline-text');
            const reviewCountText = reviewCountElement?.textContent?.replace(/[^0-9]/g, '') || '0';
            const reviewCount = parseInt(reviewCountText, 10);

            if (title && rating && imageUrl) {
                products.push({
                    title,
                    rating,
                    imageUrl,
                    reviewCount
                });
            }
        });

        return products;
    }
} 