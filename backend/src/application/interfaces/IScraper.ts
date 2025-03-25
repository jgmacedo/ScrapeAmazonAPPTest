import type { Product } from '../../domain/entities/Product';

export interface IScraper {
    scrapeSearchPage(keyword: string): Promise<Product[]>;
} 