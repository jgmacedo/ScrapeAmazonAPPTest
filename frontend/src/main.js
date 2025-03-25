import './style.css'

document.addEventListener('DOMContentLoaded', () => {
  const searchForm = document.getElementById('searchForm');
  const searchInput = document.getElementById('searchInput');
  const searchButton = document.getElementById('searchButton');
  const loading = document.getElementById('loading');
  const results = document.getElementById('results');

  const RATE_LIMIT = {
    MAX_REQUESTS: 10,
    WARNING_THRESHOLD: 5,
    TIME_WINDOW: 60 // in seconds
  };

  searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const searchTerm = searchInput.value.trim();
    if (!searchTerm) return;

    // Show loading state
    loading.classList.remove('hidden');
    results.innerHTML = '';
    searchButton.disabled = true;

    try {
      const response = await fetch(`http://localhost:3001/api/scrape?keyword=${encodeURIComponent(searchTerm)}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      // Handle rate limiting
      const remainingRequests = response.headers.get('X-RateLimit-Remaining');
      const resetTime = response.headers.get('X-RateLimit-Reset');
      
      if (remainingRequests) {
        updateRateLimitInfo(parseInt(remainingRequests), resetTime);
      }

      if (response.status === 429) {
        const resetTimeInSeconds = Math.ceil(resetTime / 1000);
        throw new Error(`Rate limit exceeded. You can make ${RATE_LIMIT.MAX_REQUESTS} requests per minute. Please try again in ${resetTimeInSeconds} seconds.`);
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Received data:', data);
      
      // Display results
      if (data && data.length > 0) {
        results.innerHTML = data.map(product => `
          <div class="product-card">
            <img src="${product.imageUrl}" alt="${product.title}" class="product-image">
            <div class="product-info">
              <h3 class="product-title">${product.title}</h3>
              <div class="product-rating">
                ${'★'.repeat(Math.floor(product.rating))}${product.rating % 1 !== 0 ? '½' : ''}
                ${'☆'.repeat(5 - Math.ceil(product.rating))}
                <span class="review-count">(${product.reviewCount.toLocaleString()} reviews)</span>
              </div>
            </div>
          </div>
        `).join('');
      } else {
        results.innerHTML = '<div class="error-message">No products found. Try a different search term.</div>';
      }
    } catch (error) {
      console.error('Error:', error);
      results.innerHTML = `
        <div class="error-message">
          ${error.message}
        </div>
      `;
    } finally {
      // Hide loading state
      loading.classList.add('hidden');
      searchButton.disabled = false;
    }
  });

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
}); 