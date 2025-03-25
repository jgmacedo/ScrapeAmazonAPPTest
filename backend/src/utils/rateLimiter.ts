export class RateLimiter {
  private requests: Map<string, number[]>;
  private readonly maxRequests: number;
  private readonly timeWindow: number; // in milliseconds

  constructor(maxRequests: number = 10, timeWindow: number = 60000) {
    this.requests = new Map();
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindow;
  }

  isAllowed(key: string): boolean {
    const now = Date.now();
    const timestamps = this.requests.get(key) || [];
    
    // Remove old timestamps
    const recentTimestamps = timestamps.filter(
      timestamp => now - timestamp < this.timeWindow
    );

    if (recentTimestamps.length >= this.maxRequests) {
      return false;
    }

    // Add new timestamp
    recentTimestamps.push(now);
    this.requests.set(key, recentTimestamps);
    return true;
  }

  getRemainingRequests(key: string): number {
    const now = Date.now();
    const timestamps = this.requests.get(key) || [];
    const recentTimestamps = timestamps.filter(
      timestamp => now - timestamp < this.timeWindow
    );
    return Math.max(0, this.maxRequests - recentTimestamps.length);
  }

  getTimeUntilReset(key: string): number {
    const timestamps = this.requests.get(key) || [];
    if (timestamps.length === 0) return 0;
    
    const oldestTimestamp = Math.min(...timestamps);
    const timeUntilReset = this.timeWindow - (Date.now() - oldestTimestamp);
    return Math.max(0, timeUntilReset);
  }
} 