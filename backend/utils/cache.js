// Simple in-memory cache with TTL (Time To Live)
class Cache {
    constructor() {
        this.cache = new Map();
    }

    // Set a cache entry with optional TTL in seconds (default: 5 minutes)
    set(key, value, ttl = 300) {
        const expiry = Date.now() + ttl * 1000;
        this.cache.set(key, { value, expiry });
    }

    // Get a cache entry
    get(key) {
        const entry = this.cache.get(key);

        if (!entry) {
            return null;
        }

        // Check if entry has expired
        if (Date.now() > entry.expiry) {
            this.cache.delete(key);
            return null;
        }

        return entry.value;
    }

    // Delete a cache entry
    delete(key) {
        this.cache.delete(key);
    }

    // Clear all cache
    clear() {
        this.cache.clear();
    }

    // Get cache size
    size() {
        return this.cache.size;
    }
}

export default new Cache();
