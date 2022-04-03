import {Cache} from "../types.js";

/** Configuration option for TimeCache */
export interface TimeCacheOptions {
  /** How long until a cache entry is removed from the cache. */
  entryDurationInMs: number;
  /** Set to true to reset the timer of an entry when it is retrieved */
  resetDurationOnGet: boolean;
}

/** A single entry in a TimeCache */
interface TimeCacheEntry<ValueType> {
  value: ValueType;
  /** The date at which this entry should be removed */
  expiresAtDate: number;
}

/**
 * Cache where entries expires on a timer.
 *
 * Defaults to 5s and no reset duration on get.
 */
export default class TimeCache<ValueType = unknown> implements Cache<ValueType> {
  #options: TimeCacheOptions;
  #map = new Map<KeyType, TimeCacheEntry<ValueType>>();
  #timeout: number | undefined;
  #boundCleanerMethod: () => void;

  public constructor(options?: Partial<TimeCacheOptions>) {
    this.#options = {
      entryDurationInMs: 5000,
      resetDurationOnGet: false,
      ...options,
    };
    this.#boundCleanerMethod = this.#cleanEntries.bind(this);
  }

  public set(key: KeyType, value?: ValueType): void {
    const currentEntry = this.#map.get(key);
    if (currentEntry !== undefined) {
      if (value === undefined) {
        this.#map.delete(key);
      } else {
        currentEntry.value = value;
        currentEntry.expiresAtDate = this.#getExpireDate();
      }
    }
    if (value === undefined) return;
    const newEntry: TimeCacheEntry<ValueType> = {
      value,
      expiresAtDate: this.#getExpireDate(),
    };
    this.#map.set(key, newEntry);
    this.#armTimer(newEntry.expiresAtDate);
  }

  public get(key: KeyType): ValueType | undefined {
    const entry = this.#map.get(key);
    if (entry) {
      if (this.#options.resetDurationOnGet) entry.expiresAtDate = this.#getExpireDate();
      return entry.value;
    }
  }

  public clear(): void {
    this.#map.clear();
    if (this.#timeout) {
      clearTimeout(this.#timeout);
      this.#timeout = undefined;
    }
  }

  /** Return the expiration date for an entry created at this point in time */
  #getExpireDate() {
    return Date.now() + this.#options.entryDurationInMs;
  }

  /** Purge old entries */
  #cleanEntries() {
    this.#timeout = undefined;
    const now = Date.now();
    let nextExpireDate: number | undefined;
    const keysToDelete: Array<KeyType> = [];
    for (const [key, entry] of this.#map) {
      if (entry.expiresAtDate <= now) {
        keysToDelete.push(key);
      } else if (nextExpireDate === undefined || nextExpireDate > entry.expiresAtDate) {
        nextExpireDate = entry.expiresAtDate;
      }
    }
    for (const key of keysToDelete) this.#map.delete(key);
    if (nextExpireDate !== undefined) this.#armTimer(nextExpireDate);
  }

  /**
   * Make sure the timer is set.
   *
   * Can be safely called multiple time, at most one timer will be set.
   */
  #armTimer(targetDate: number) {
    if (this.#timeout !== undefined) return;
    const now = Date.now();
    const interval = Math.max(1, targetDate - now);
    this.#timeout = setTimeout(this.#boundCleanerMethod, interval) as unknown as number;
  }
}
