import './style.css'

document.addEventListener('DOMContentLoaded', () => {
  const searchForm = document.getElementById('search-form');
  const searchInput = document.getElementById('search-input');
  const searchButton = document.getElementById('searchButton');
  const loading = document.getElementById('loading-indicator');
  const results = document.getElementById('results-container');
  const errorMessage = document.getElementById('error-message');

  const RATE_LIMIT = {
    MAX_REQUESTS: 10,
    WARNING_THRESHOLD: 5,
    TIME_WINDOW: 60 // in seconds
  };

  const API_URL = 'http://localhost:3001/api/scrape';

  /**
   * Displays an error message to the user
   * @param {string} message - The error message to display
   */
  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    results.innerHTML = '';
  }

  /**
   * Hides the error message
   */
  function hideError() {
    errorMessage.style.display = 'none';
  }

  /**
   * Shows the loading indicator
   */
  function showLoading() {
    loading.style.display = 'block';
    results.innerHTML = '';
  }

  /**
   * Hides the loading indicator
   */
  function hideLoading() {
    loading.style.display = 'none';
  }

  /**
   * Formats a number with commas for better readability
   * @param {number} number - The number to format
   * @returns {string} The formatted number
   */
  function formatNumber(number) {
    return number.toLocaleString();
  }

  /**
   * Creates a product card element with the given product data
   * @param {Object} product - The product data
   * @returns {HTMLElement} The product card element
   */
  function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';

    // Create product image
    const img = document.createElement('img');
    img.src = product.imageUrl;
    img.alt = product.title;
    img.className = 'product-image';

    // Create product title
    const title = document.createElement('h3');
    title.className = 'product-title';
    title.textContent = product.title;

    // Create product rating section
    const ratingContainer = document.createElement('div');
    ratingContainer.className = 'product-rating';
    
    // Add rating number
    const ratingNumber = document.createElement('span');
    ratingNumber.className = 'rating-number';
    ratingNumber.textContent = product.rating;
    
    // Add rating text
    const ratingText = document.createElement('span');
    ratingText.className = 'rating-text';
    ratingText.textContent = ' / 5';
    
    // Add review count
    const reviews = document.createElement('div');
    reviews.className = 'product-reviews';
    reviews.textContent = `${formatNumber(product.reviewCount)} reviews`;

    // Assemble rating section
    ratingContainer.appendChild(ratingNumber);
    ratingContainer.appendChild(ratingText);
    ratingContainer.appendChild(reviews);

    // Assemble product card
    card.appendChild(img);
    card.appendChild(title);
    card.appendChild(ratingContainer);

    return card;
  }

  /**
   * Handles the search form submission
   * @param {Event} event - The form submission event
   */
  async function handleSearch(event) {
    event.preventDefault();
    const keyword = searchInput.value.trim();

    if (!keyword) {
      showError('Please enter a search term');
      return;
    }

    hideError();
    showLoading();

    try {
      const response = await fetch(`${API_URL}?keyword=${encodeURIComponent(keyword)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch products');
      }

      if (!Array.isArray(data) || data.length === 0) {
        showError('No products found');
        return;
      }

      // Clear previous results and display new ones
      results.innerHTML = '';
      data.forEach(product => {
        results.appendChild(createProductCard(product));
      });
    } catch (error) {
      showError(error.message || 'An error occurred while searching');
    } finally {
      hideLoading();
    }
  }

  function updateRateLimitInfo(remaining, resetTime) {
    const rateLimitInfo = document.getElementById('rateLimitInfo') || createRateLimitInfo();
    
    if (remaining <= RATE_LIMIT.WARNING_THRESHOLD) {
      const resetTimeInSeconds = Math.ceil(resetTime / 1000);
      const warningMessage = remaining > 0 
        ? `${remaining}/${RATE_LIMIT.MAX_REQUESTS} requests remaining in this minute. Limit resets in ${resetTimeInSeconds} seconds.`
        : `Rate limit reached. You can make ${RATE_LIMIT.MAX_REQUESTS} requests per minute. Please wait ${resetTimeInSeconds} seconds.`;

      rateLimitInfo.innerHTML = `
        <div class="rate-limit-warning ${remaining === 0 ? 'critical' : ''}">
          <i class="fas fa-exclamation-triangle"></i>
          ${warningMessage}
        </div>
      `;
      rateLimitInfo.style.display = 'block';
    } else {
      rateLimitInfo.style.display = 'none';
    }
  }

  function createRateLimitInfo() {
    const rateLimitInfo = document.createElement('div');
    rateLimitInfo.id = 'rateLimitInfo';
    rateLimitInfo.className = 'rate-limit-info';
    document.querySelector('.search-form').appendChild(rateLimitInfo);
    return rateLimitInfo;
  }

  // Event Listeners
  searchForm.addEventListener('submit', handleSearch);
}); 