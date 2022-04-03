/**
 * Acceptable key types for caches
 */
export type KeyType = string | number;

/**
 * Basic synchronous Cache interface shared by all implementations
 */
export interface Cache<ValueType> {
  /**
   * Return the value associated with a key if it is still in the cache, or undefined.
   */
  get(key: KeyType): ValueType | undefined;

  /**
   * Define a value associated with a key.
   */
  set(key: KeyType, value?: ValueType): void;

  /**
   * Remove all entries from the cache.
   */
  clear(): void;
}
