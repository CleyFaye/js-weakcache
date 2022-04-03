import {Cache, KeyType} from "../types.js";
import CacheEntry from "./entry.js";

export interface WeakCacheOptions {
  /** Maximum number of entries in the WeakCache */
  maxSize: number;
}

/** Default values */
const defaultOptions: WeakCacheOptions = {maxSize: 64};

/** Manage a cache of values that can be cleaned when it grows too big.
 */
export default class WeakCache<ValueType = unknown> implements Cache<ValueType> {
  #opt: WeakCacheOptions;
  #cache = new Map<KeyType, CacheEntry<ValueType>>();

  /** Create a cache object
   *
   */
  public constructor(options?: Partial<WeakCacheOptions>) {
    this.#opt = {
      ...defaultOptions,
      ...options,
    };
    if (this.#opt.maxSize <= 0) throw new Error("Cache size can't be negative or null");
  }

  /** Set a cache value for the given key. */
  public set(key: KeyType, value: ValueType): void {
    if (value === undefined && this.#cache.has(key)) {
      this.#cache.delete(key);
      return;
    }
    this.#ageOthers();
    if (!this.#cache.has(key) && (this.#entriesCount() >= this.#opt.maxSize)) {
      this.#removeStaleEntries();
    }
    this.#cache.set(key, new CacheEntry(value));
  }

  /** Return the cached value for a key.
   *
   * @return
   * The cached value, or undefined if the key is not in the cache.
   */
  public get(key: KeyType): ValueType | undefined {
    const cacheEntry = this.#cache.get(key);
    if (!cacheEntry) return undefined;
    this.#ageOthers(cacheEntry);
    return cacheEntry.get();
  }

  /** Age all entries */
  #ageOthers(immuneEntry?: CacheEntry<ValueType>) {
    for (const [, cacheEntry] of this.#cache) {
      if (cacheEntry !== immuneEntry) cacheEntry.doAge();
    }
  }

  /** Remove entries until the cache is smaller than the allocated space */
  #removeStaleEntries() {
    while (this.#entriesCount() >= this.#opt.maxSize) {
      let candidate;
      let maxAge = 0;
      for (const [key, cacheEntry] of this.#cache) {
        if (cacheEntry.age > maxAge) {
          maxAge = cacheEntry.age;
          candidate = key;
        }
      }
      if (!candidate) throw new Error("Unexpected state");
      this.#cache.delete(candidate);
    }
  }

  #entriesCount() {
    return this.#cache.size;
  }
}
