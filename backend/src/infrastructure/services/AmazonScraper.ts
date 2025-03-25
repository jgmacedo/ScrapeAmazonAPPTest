import { JSDOM } from 'jsdom';
import axios from 'axios';
import type { IScraper } from '../../application/interfaces/IScraper';
import type { Product } from '../../domain/entities/Product';
import { config } from '../../config/config';

/**
 * AmazonScraper implements the IScraper interface to scrape product data from Amazon.
 * It uses ScrapeOps as a proxy service to avoid Amazon's anti-bot measures.
 */
export class AmazonScraper implements IScraper {
    private retryCount: number = 0;
    
    constructor(private readonly apiKey: string = config.scrapeOpsApiKey) {
        console.log('AmazonScraper initialized with API key:', this.apiKey ? 'Present' : 'Missing');
    }

    /**
     * Generates the ScrapeOps URL with necessary parameters.
     * Uses render_js: false to improve performance since we don't need JavaScript execution.
     */
    private getScrapeopsUrl(keyword: string): string {
        const url = `${config.amazonBaseUrl}/s?k=${encodeURIComponent(keyword)}&page=1`;
        const params = new URLSearchParams({
            api_key: this.apiKey,
            url: url,
            country: 'us',
            render_js: 'false'  // Disable JavaScript rendering for better performance
        });
        const scrapeopsUrl = `https://proxy.scrapeops.io/v1/?${params.toString()}`;
        console.log('Generated ScrapeOps URL:', scrapeopsUrl);
        return scrapeopsUrl;
    }

    /**
     * Implements retry logic for failed requests.
     * Uses exponential backoff with configurable retry attempts and timeout.
     */
    private async retryRequest(url: string): Promise<any> {
        try {
            console.log('Making request with timeout:', config.scrapingConfig.timeout);
            const response = await axios.get(url, {
                timeout: config.scrapingConfig.timeout,
                headers: {
                    'User-Agent': config.userAgent
                }
            });
            console.log('Response status:', response.status);
            console.log('Response data length:', response.data?.length || 0);
            return response;
        } catch (error) {
            if (error instanceof Error) {
                console.error('Request error:', error.message);
            }
            if (this.retryCount < config.scrapingConfig.retries) {
                this.retryCount++;
                console.log(`Retry attempt ${this.retryCount} of ${config.scrapingConfig.retries}`);
                await new Promise(resolve => setTimeout(resolve, 1000));
                return this.retryRequest(url);
            }
            throw error;
        }
    }

    /**
     * Main scraping method that orchestrates the scraping process.
     * Handles request retries and response validation.
     */
    async scrapeSearchPage(keyword: string): Promise<Product[]> {
        try {
            console.log('Starting scrape for keyword:', keyword);
            this.retryCount = 0;
            const url = this.getScrapeopsUrl(keyword);
            const response = await this.retryRequest(url);

            if (response.status !== 200) {
                throw new Error(`Failed to scrape page: ${response.status}`);
            }

            const products = this.parseSearchResults(response.data);
            console.log(`Found ${products.length} products`);
            return products;
        } catch (error) {
            console.error('Scraping error:', error instanceof Error ? error.message : 'Unknown error');
            throw error;
        }
    }

    /**
     * Parses the HTML response and extracts product information.
     * Handles different product layouts (electronics vs consumables) by trying multiple selectors.
     */
    private parseSearchResults(html: string): Product[] {
        console.log('Starting to parse HTML');
        const dom = new JSDOM(html);
        const document = dom.window.document;
        const products: Product[] = [];

        // Find all product divs that have a valid ASIN (Amazon's product ID)
        const productDivs = document.querySelectorAll('[data-asin]:not([data-asin=""])');
        console.log(`Found ${productDivs.length} product divs`);

        productDivs.forEach((div, index) => {
            try {
                // Try multiple selectors for title to handle different product layouts
                const titleSelectors = [
                    'h2.a-size-medium span',  // Electronics layout
                    'h2.a-size-base-plus span', // Consumables layout
                    'h2 span.a-text-normal',
                    'h2.a-size-mini span'
                ];
                let title = '';
                for (const selector of titleSelectors) {
                    const titleElement = div.querySelector(selector);
                    if (titleElement?.textContent?.trim()) {
                        title = titleElement.textContent.trim();
                        break;
                    }
                }

                // Try multiple selectors for rating to handle different layouts
                const ratingSelectors = [
                    'i.a-icon-star-small span.a-icon-alt',  // Electronics layout
                    'i.a-icon-star span.a-icon-alt',       // Consumables layout
                    'span[aria-label*="out of 5 stars"]'
                ];
                let rating = 0;
                for (const selector of ratingSelectors) {
                    const ratingElement = div.querySelector(selector);
                    const ratingText = ratingElement?.getAttribute('aria-label') || ratingElement?.textContent || '';
                    if (ratingText) {
                        const ratingMatch = ratingText.match(/(\d+(\.\d+)?)/);
                        if (ratingMatch && ratingMatch[1]) {
                            rating = parseFloat(ratingMatch[1]);
                            break;
                        }
                    }
                }

                // Try multiple selectors for image URL
                const imageSelectors = [
                    'img.s-image',           // Electronics layout
                    '.s-image',              // Consumables layout
                    'img[data-image-load]',
                    '.a-section img'
                ];
                let imageUrl = '';
                for (const selector of imageSelectors) {
                    const imageElement = div.querySelector(selector);
                    const imgSrc = imageElement?.getAttribute('src');
                    if (imgSrc && !imgSrc.includes('data:image')) {
                        imageUrl = imgSrc;
                        break;
                    }
                }

                // Try multiple selectors for review count
                const reviewSelectors = [
                    'span.a-size-base.s-underline-text',  // Electronics layout
                    'span[aria-label*="reviews"]',        // Consumables layout
                    '[data-cy="reviews-block"] .a-size-base',
                    'a.a-link-normal span.a-size-base'
                ];
                let reviewCount = 0;
                for (const selector of reviewSelectors) {
                    const reviewElement = div.querySelector(selector);
                    const reviewText = reviewElement?.getAttribute('aria-label') || reviewElement?.textContent || '';
                    if (reviewText) {
                        const count = parseInt(reviewText.replace(/[^0-9]/g, ''), 10);
                        if (!isNaN(count)) {
                            reviewCount = count;
                            break;
                        }
                    }
                }

                // Only add products that have all required fields
                if (title && rating && imageUrl) {
                    products.push({
                        title,
                        rating,
                        imageUrl,
                        reviewCount
                    });
                    console.log(`Successfully parsed product ${index + 1}:`, { 
                        title: title.substring(0, 30) + '...',
                        rating,
                        reviewCount,
                        imageUrl: imageUrl.substring(0, 50) + '...'
                    });
                } else {
                    console.log(`Skipping product ${index + 1} due to missing required fields:`, {
                        hasTitle: !!title,
                        hasRating: !!rating,
                        hasImage: !!imageUrl
                    });
                }
            } catch (error) {
                console.error(`Error parsing product ${index + 1}:`, error instanceof Error ? error.message : 'Unknown error');
            }
        });

        return products;
    }
} 