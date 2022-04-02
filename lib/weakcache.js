import assert from "assert";
import CacheEntry from "./entry.js";

const modeLFU = Symbol("LFU");
const modeLRU = Symbol("LRU");
const modes = [modeLFU, modeLRU];

/** Default values */
const defaultOptions = {
  // 64MB
  maxSize: 67108864,
  mode: modeLRU,
  lfuWeight: 1,
  lfuMax: 10000,
  lfuInitial: 10,
  lfuIncrease: 10,
};

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
   * @param {?Symbol} options.mode
   * Either WeakCache.modeLFU or WeakCache.modeLRU.
   * Defaults to LRU.
   * The LFU implementation is very bare.
   *
   * @param {?number} options.lfuWeight
   * A value by which each entries are lowered when a new entry come in.
   * Must be between 0 and lfuIncrease (exclusive).
   * Defaults to 1
   *
   * @param {?number} options.lfuMax
   * The high bound after which a value is not marked as "used more" anymore for
   * LFU.
   * Defaults to 10000
   *
   * @param {?number} options.lfuInitial
   * The initial counter value for LFU.
   * Defaults to 10.
   *
   * @param {number} options.lfuIncrease
   * The increment for the counter when a value is used.
   * Defaults to 10.
   */
  constructor(options) {
    this._opt = {
      ...defaultOptions,
      ...options,
    };
    this._totalCacheSize = 0;
    this._cache = new Map();
    assert(
      this._opt.maxSize > 0,
      "Cache size can't be negative or null",
    );
    assert(
      modes.includes(this._opt.mode),
      "Unknown cache mode",
    );
    assert(
      this._opt.lfuWeight > 0 && this._opt.lfuWeight < this._opt.lfuIncrease,
      "Invalid LFU weight",
    );
  }

  /** Set a cache value for the given key.
   *
   * @param {string} key
   * @param {any} value
   * If undefined, unset the key
   */
  set(key, value) {
    const currentEntry = this._cache.get(key);
    if (currentEntry) {
      this._removeEntry(currentEntry);
    }
    if (value !== undefined) {
      const newEntry = new CacheEntry(key, value, this);
      if (newEntry.dataSize <= this._opt.maxSize) {
        // Do not store entries that are larger than the cache, and do not purge
        // old entries in that case
        this._removeStaleEntries(newEntry.dataSize);
        this._addEntry(newEntry);
      }
    }
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

  /** Remove an entry from the cache */
  _removeEntry(cacheEntry) {
    this._totalCacheSize -= cacheEntry.dataSize;
    this._cache.delete(cacheEntry.key);
  }

  /** Add an entry to the cache */
  _addEntry(cacheEntry) {
    this._cache.set(cacheEntry.key, cacheEntry);
    this._totalCacheSize += cacheEntry.dataSize;
  }

  /** Age all entries */
  _consume() {
    if (this._opt.mode === WeakCache.modeLFU) {
      for (const [, cacheEntry] of this._cache) {
        cacheEntry.doAge();
      }
    }
  }

  /** Remove entries until the cache is smaller than the allocated space
   *
   * @param {number} extraSize
   * The extra size to add to the current cache size in preparation for
   * insertion
   */
  _removeStaleEntries(extraSize = 0) {
    switch (this._opt.mode) {
    case WeakCache.modeLFU: return this._removeStaleEntriesLFU(extraSize);
    case WeakCache.modeLRU: return this._removeStaleEntriesLRU(extraSize);
    }
    throw new Error("Unknown cache cleaning mode");
  }

  _removeStaleEntriesLFU(extraSize) {
    while ((this._totalCacheSize + extraSize) > this._opt.maxSize) {
      let lowestAge = null;
      for (const [, cacheEntry] of this._cache) {
        if (cacheEntry.usage === 0) {
          this._removeEntry(cacheEntry);
          if ((this._totalCacheSize + extraSize) <= this._opt.maxSize) {
            return;
          }
          continue;
        }
        if (lowestAge === null) {
          lowestAge = cacheEntry.usage;
        } else {
          lowestAge = Math.min(lowestAge, cacheEntry.usage);
        }
      }
      for (const [, cacheEntry] of this._cache) {
        if (cacheEntry.usage === lowestAge) {
          this._removeEntry(cacheEntry);
          if ((this._totalCacheSize + extraSize) <= this._opt.maxSize) {
            return;
          }
        }
      }
    }
  }

  _removeStaleEntriesLRU(extraSize) {
    for (const [key, cacheEntry] of this._cache) {
      if ((this._totalCacheSize + extraSize) <= this._opt.maxSize) {
        return;
      }
      this._totalCacheSize -= cacheEntry.dataSize;
      this._cache.delete(key);
    }
  }
}
WeakCache.modeLFU = modeLFU;
WeakCache.modeLRU = modeLRU;
WeakCache.modes = [WeakCache.modeLFU, WeakCache.modeLRU];
