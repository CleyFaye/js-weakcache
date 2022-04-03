import assert from "assert";
import CacheEntry from "./entry.js";

/** Default values */
const defaultOptions = {maxSize: 64};

/** Manage a cache of values that can be cleaned when it grows too big.
 */
export default class WeakCache {
  /** Create a cache object
   *
   * @param {Object} options
   * @param {?number} options.maxSize
   * Max stored entries.
   */
  constructor(options) {
    this._opt = {
      ...defaultOptions,
      ...options,
    };
    this._cache = new Map();
    assert(
      this._opt.maxSize > 0,
      "Cache size can't be negative or null",
    );
  }

  /** Set a cache value for the given key.
   *
   * @param {string} key
   * @param {any} value
   * If undefined, unset the key
   */
  set(key, value) {
    this._ageOthers();
    if (!this._cache.has(key) && (this.#entriesCount() >= this._opt.maxSize)) {
      this._removeStaleEntries();
    }
    this._cache.set(key, new CacheEntry(value));
  }

  /** Return the cached value for a key.
   *
   * @return {any}
   * The cached value, or undefined if the key is not in the cache.
   */
  get(key) {
    const cacheEntry = this._cache.get(key);
    if (!cacheEntry) return undefined;
    this._ageOthers(cacheEntry);
    return cacheEntry.get();
  }

  /** Age all entries */
  _ageOthers(immuneEntry) {
    for (const [, cacheEntry] of this._cache) {
      if (cacheEntry !== immuneEntry) cacheEntry.doAge();
    }
  }

  /** Remove entries until the cache is smaller than the allocated space */
  _removeStaleEntries() {
    while (this.#entriesCount() >= this._opt.maxSize) {
      let candidate;
      let maxAge = 0;
      for (const [key, cacheEntry] of this._cache) {
        if (cacheEntry.age > maxAge) {
          maxAge = cacheEntry.age;
          candidate = key;
        }
      }
      if (!candidate) throw new Error("Unexpected state");
      this._cache.delete(candidate);
    }
  }

  #entriesCount() {
    return this._cache.size;
  }
}
