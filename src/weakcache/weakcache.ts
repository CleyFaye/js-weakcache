import {Cache, KeyType} from "../types.js";

/** Configuration options for WeakCache */
export interface WeakCacheOptions {
  /** Maximum number of entries in the WeakCache */
  maxSize: number;
}

/** Information about a single WeakCache entry */
interface WeakCacheEntry<ValueType> {
  /** How long since this entry was accessed. It is reset to 0 on each access. */
  age: number;
  value: ValueType;
}

/** Manage a cache of values that can be cleaned when it grows too big. */
export default class WeakCache<ValueType = unknown> implements Cache<ValueType> {
  #opt: WeakCacheOptions;
  #cache = new Map<KeyType, WeakCacheEntry<ValueType>>();

  public constructor(options?: Partial<WeakCacheOptions>) {
    this.#opt = {
      maxSize: 64,
      ...options,
    };
    if (this.#opt.maxSize <= 0) throw new Error("Cache size can't be negative or null");
  }

  public set(key: KeyType, value?: ValueType): void {
    if (value === undefined) {
      if (this.#cache.has(key)) this.#cache.delete(key);
      return;
    }
    this.#ageOthers();
    if (!this.#cache.has(key) && (this.#entriesCount() >= this.#opt.maxSize)) {
      this.#removeStaleEntries();
    }
    this.#cache.set(
      key,
      {
        age: 0,
        value,
      },
    );
  }

  public get(key: KeyType): ValueType | undefined {
    const cacheEntry = this.#cache.get(key);
    if (!cacheEntry) return undefined;
    this.#ageOthers(cacheEntry);
    cacheEntry.age = 0;
    return cacheEntry.value;
  }

  public clear(): void {
    this.#cache.clear();
  }

  /** Age all entries, used to determine which one have to go if cleaning is needed */
  #ageOthers(immuneEntry?: WeakCacheEntry<ValueType>) {
    for (const [, cacheEntry] of this.#cache) {
      if (cacheEntry !== immuneEntry) {
        if (cacheEntry.age < Number.MAX_SAFE_INTEGER) ++cacheEntry.age;
      }
    }
  }

  /** Remove entries until the cache is smaller than the configured number of entries */
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
