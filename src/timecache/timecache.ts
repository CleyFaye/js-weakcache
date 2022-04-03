import {Cache} from "../types";

export interface TimeCacheOptions {
  entryDurationInMs: number;
  resetDurationOnGet: boolean;
}

interface TimeCacheEntry<ValueType> {
  value: ValueType;
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
        currentEntry.expiresAtDate = Date.now() + this.#options.entryDurationInMs;
      }
    }
    if (value === undefined) return;
    const newEntry: TimeCacheEntry<ValueType> = {
      value,
      expiresAtDate: Date.now() + this.#options.entryDurationInMs,
    };
    this.#map.set(key, newEntry);
    this.#armTimer(newEntry.expiresAtDate);
  }

  public get(key: KeyType): ValueType | undefined {
    return this.#map.get(key)?.value;
  }

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

  #armTimer(targetDate: number) {
    if (this.#timeout !== undefined) return;
    const now = Date.now();
    const interval = Math.max(1, targetDate - now);
    this.#timeout = setInterval(this.#boundCleanerMethod, interval) as unknown as number;
  }
}
