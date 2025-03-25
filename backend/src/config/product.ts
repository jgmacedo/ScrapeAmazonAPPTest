export interface Product {
  title: string;
  rating: string;
  reviewCount: string;
  imageUrl: string;
}

export interface SearchResult {
  keyword: string;
  totalResults: number;
  products: Product[];
  remainingRequests: number;
} 