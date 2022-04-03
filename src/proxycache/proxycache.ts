import {Cache} from "../types.js";

export type FetchFunction<ValueType> = (key: KeyType) => Promise<ValueType | undefined>;

/**
 * Automatic promise-based cache over another cache implementation.
 *
 * The caller must provide a function that will fetch the data based on the key.
 * This function is automatically called on cache-miss when calling `get()`.
 */
export default class ProxyCache<ValueType = unknown> {
  #backend: Cache<ValueType>;
  #fetchMap = new Map<KeyType, Promise<ValueType | undefined>>();
  #fetchFunction: FetchFunction<ValueType>;

  public constructor(
    cacheBackend: Cache<ValueType>,
    fetchFunction: FetchFunction<ValueType>,
  ) {
    this.#backend = cacheBackend;
    this.#fetchFunction = fetchFunction;
  }

  public async get(key: KeyType): Promise<ValueType | undefined> {
    const storedValue = this.#backend.get(key);
    if (storedValue !== undefined) return storedValue;
    // Value not in cache at all, either create new fetch or wait existing one
    const currentFetchPromise = this.#fetchMap.get(key);
    if (currentFetchPromise === undefined) {
      // Start a new fetch
      const promise = this.#fetchFunction(key);
      this.#fetchMap.set(key, promise);
      const value = await promise;
      this.#fetchMap.delete(key);
      const setValue = this.#backend.get(key);
      if (setValue !== undefined) return setValue;
      this.#backend.set(key, value);
      return value;
    }
    // Wait existing fetch
    const value = await currentFetchPromise;
    const setValue = this.#backend.get(key);
    if (setValue !== undefined) return setValue;
    return value;
  }

  /**
   * Update data in-place.
   *
   * Useful when the system knows that the data was updated and need not to be fetched to get the
   * new value.
   *
   * Note that calling this while a fetch is currently ongoing will not stop the fetch operation,
   * but will override its return value.
   *
   * @param value
   * If undefined is provided, the value is removed from the cache and would need to be fetched
   * again on the next call to `get()`
   */
  public set(key: KeyType, value?: ValueType): void {
    this.#backend.set(key, value);
  }

  /**
   * Clear all cached entries.
   *
   * Active fetch will still return a value and cache it.
   */
  public clear(): void {
    this.#backend.clear();
  }
}
