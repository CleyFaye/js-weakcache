import assert from "assert";
import CacheEntry from "./entry";

/** Manage a cache of values that can be cleaned when it grows too big.
 */
export default class WeakCache {
  /** Create a cache object
   *
   * @param {Object} options
   * @param {?number} options.maxSize
   * Max size for the stored data.
   * This does not take into account the JavaScript overhead for storing said
   * data. Default to 64MB.
   *
   * @param {?string} options.mode
   * Either "LRU" for Least Recently Used of "LFU" for Least Frequently Used.
   * Defaults to "LRU".
   * The "LFU" implementation is very bare.
   * You should use WeakCache.modeLFU and WeakCache.modeLRU instead of the
   * string literals.
   *
   * @param {?number} options.lfuWeight
   * A value by which each entries are lowered when a new entry come in.
   * Must be between 0 and 1 (exclusive).
   * Defaults to 0.1
   */
  constructor(options) {
    if (!options) {
      options = {};
    }
    this._maxSize = options.maxSize || 64 * 1024 * 1024;
    this._mode = options.mode || WeakCache.modeLRU;
    this._lfuWeight = options.lfuWeight || 0.1;
    this._totalCacheSize = 0;
    this._cache = new Map();
    assert(this._maxSize > 0, "Cache size can't be negative or null");
    assert(WeakCache.modes.includes(this._mode), "Unknown cache mode");
    assert(this._lfuWeight > 0 && this._lfuWeight < 1, "Invalid LFU weight");
  }

  /** Set a cache value for the given key.
   *
   * @param {string} key
   * @param {any} value
   * If undefined, unset the key
   */
  set(key, value) {
    let cacheSizeImpact = 0;
    const currentEntry = this._cache.get(key);
    if (currentEntry) {
      cacheSizeImpact -= currentEntry.getDataSize();
      this._cache.delete(key);
    }
    if (value !== undefined) {
      const newEntry = new CacheEntry(value);
      if (newEntry.getDataSize() <= this._maxSize) {
        // Do not store entries that are larger than the cache, and do not purge
        // old entries
        this._cache.set(key, newEntry);
        cacheSizeImpact += newEntry.getDataSize();
      }
    }
    this._totalCacheSize += cacheSizeImpact;
    this._removeStaleEntries();
  }

  /** Return the cached value for a key.
   *
   * @return {any}
   * The cached value, or undefined if the key is not in the cache.
   */
  get(key) {
    const cacheEntry = this._cache.get(key);
    if (!cacheEntry) {
      return undefined;
    }
    // We remove/readd both for _consume() and LRU ordering
    this._cache.delete(key);
    this._consume();
    this._cache.set(key, cacheEntry);
    return cacheEntry.get();
  }

  /** Age all entries */
  _consume() {
    if (this._mode == WeakCache.modeLFU) {
      for (let [, cacheEntry] of this._cache) {
        cacheEntry.doAge();
      }
    }
  }

  /** Remove entries until the cache is smaller than the allocated space */
  _removeStaleEntries() {
    if (this._totalCacheSize <= this._maxSize) {
      return;
    }
    switch (this._mode) {
    case WeakCache.modeLFU: return this._removeStaleEntriesLFU();
    case WeakCache.modeLRU: return this._removeStaleEntriesLRU();
    }
    throw new Error("Unknown cache cleaning mode");
  }

  _removeStaleEntriesLFU() {
    while (this._totalCacheSize > this._maxSize) {
      let lowestAge = null;
      for (let [key, cacheEntry] of this._cache) {
        if (cacheEntry.getAge() == 0) {
          this._totalCacheSize -= cacheEntry.getDataSize();
          this._cache.delete(key);
          if (this._totalCacheSize < this._maxSize) {
            break;
          }
          continue;
        }
        if (lowestAge === null) {
          lowestAge = cacheEntry.getAge();
        }
      }
      for (let [key, cacheEntry] of this._cache) {
        if (cacheEntry.getAge() == lowestAge) {
          this._totalCacheSize -= cacheEntry.getDataSize();
          this._cache.delete(key);
          if (this._totalCacheSize < this._maxSize) {
            break;
          }
        }
      }
    }
  }

  _removeStaleEntriesLRU() {
    for (let [key, cacheEntry] of this._cache) {
      if (this._totalCacheSize < this._maxSize) {
        break;
      }
      this._totalCacheSize -= cacheEntry.getDataSize();
      this._cache.delete(key);
    }
  }
}
WeakCache.modeLFU = "LFU";
WeakCache.modeLRU = "LRU";
WeakCache.modes = [WeakCache.modeLFU, WeakCache.modeLRU];
