import axios from "axios";
import * as cheerio from "cheerio";
import express from "express";
import { config } from "./config/config";
import productRoutes from "./routes/productRoutes";

interface SearchResult {
  title: string;
  price: string;
  link: string;
}

class AmazonScraper {
  async scrapeSearchPage(keyword: string): Promise<SearchResult[]> {
    const url = `https://www.amazon.com/s?k=${encodeURIComponent(keyword)}`;

    try {
      const response = await axios.get(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
        },
      });

      const html = response.data;
      const $ = cheerio.load(html);

      const results: SearchResult[] = [];
      $(".s-result-item").each((index, element) => {
        const title = $(element).find("h2 a span").text().trim();
        const price = $(element).find(".a-price-whole").text().trim();
        const link = $(element).find("h2 a").attr("href");

        if (title && link) {
          results.push({
            title,
            price,
            link: `https://www.amazon.com${link}`,
          });
        }
      });

      return results;
    } catch (error) {
      console.error("Error fetching Amazon search results:", error);
      return [];
    }
  }
}

const app = express();
const port = config.port || 3001;

// Use productRoutes for all product-related endpoints
app.use("/api", productRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
