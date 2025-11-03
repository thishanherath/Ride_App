/**
 * Geocoding Cache Service
 * Caches frequently used addresses to speed up ride creation
 */

class GeocodingCache {
  constructor() {
    this.cache = new Map();
    this.maxCacheSize = 1000; // Maximum number of cached addresses
    this.cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    
    // Cleanup expired entries every hour
    setInterval(() => {
      this.cleanupExpiredEntries();
    }, 60 * 60 * 1000);
  }

  /**
   * Generate cache key from address
   */
  generateKey(address) {
    return address.toLowerCase().trim().replace(/\s+/g, ' ');
  }

  /**
   * Get coordinates from cache
   */
  get(address) {
    const key = this.generateKey(address);
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    // Check if entry has expired
    if (Date.now() - entry.timestamp > this.cacheExpiry) {
      this.cache.delete(key);
      return null;
    }
    
    // Update access time for LRU
    entry.lastAccessed = Date.now();
    return entry.coordinates;
  }

  /**
   * Store coordinates in cache
   */
  set(address, coordinates) {
    const key = this.generateKey(address);
    
    // If cache is full, remove least recently used entry
    if (this.cache.size >= this.maxCacheSize) {
      this.removeLRU();
    }
    
    this.cache.set(key, {
      coordinates,
      timestamp: Date.now(),
      lastAccessed: Date.now()
    });
    
    console.log(`📍 Cached coordinates for: ${address.substring(0, 50)}...`);
  }

  /**
   * Remove least recently used entry
   */
  removeLRU() {
    let oldestKey = null;
    let oldestTime = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
      console.log(`🗑️ Removed LRU cache entry: ${oldestKey.substring(0, 30)}...`);
    }
  }

  /**
   * Clean up expired entries
   */
  cleanupExpiredEntries() {
    const now = Date.now();
    let removedCount = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.cacheExpiry) {
        this.cache.delete(key);
        removedCount++;
      }
    }
    
    if (removedCount > 0) {
      console.log(`🧹 Cleaned up ${removedCount} expired geocoding cache entries`);
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxCacheSize,
      hitRate: this.hitCount / (this.hitCount + this.missCount) || 0,
      hits: this.hitCount || 0,
      misses: this.missCount || 0
    };
  }

  /**
   * Clear all cache entries
   */
  clear() {
    const size = this.cache.size;
    this.cache.clear();
    console.log(`🗑️ Cleared ${size} geocoding cache entries`);
  }

  /**
   * Pre-populate cache with common addresses
   */
  prePopulate(commonAddresses) {
    console.log(`🚀 Pre-populating geocoding cache with ${commonAddresses.length} addresses`);
    
    commonAddresses.forEach(({ address, coordinates }) => {
      this.set(address, coordinates);
    });
  }
}

// Create singleton instance
const geocodingCache = new GeocodingCache();

// Pre-populate with common Sri Lankan locations
geocodingCache.prePopulate([
  {
    address: "Colombo Fort Railway Station, Colombo, Sri Lanka",
    coordinates: { ltd: 6.9344, lng: 79.8428 }
  },
  {
    address: "Bandaranaike International Airport, Katunayake, Sri Lanka", 
    coordinates: { ltd: 7.1808, lng: 79.8841 }
  },
  {
    address: "Galle Face Green, Colombo, Sri Lanka",
    coordinates: { ltd: 6.9271, lng: 79.8612 }
  },
  {
    address: "Independence Square, Colombo 7, Sri Lanka",
    coordinates: { ltd: 6.9034, lng: 79.8597 }
  },
  {
    address: "Kandy City Center, Kandy, Sri Lanka",
    coordinates: { ltd: 7.2906, lng: 80.6337 }
  }
]);

module.exports = geocodingCache;