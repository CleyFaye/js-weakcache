/*eslint-env node */
import {getDataSize} from "./utils";

/** A single cache entry.
 *
 * This class is responsible for computing the size of the stored data as well
 * as remembering how much the value is used.
 * The main cache class uses these data to purge the cache when needed.
 */
export default class Entry {
  /** Create a dangling entry.
   *
   * Entries are created in the "immune" state and can't be removed until
   * removeImmune() is called.
   */
  constructor(key, value, cache) {
    this.key = key;
    this._value = value;
    this._weakCache = cache;
    this.usage = this._weakCache._opt.lfuInitial;
    this.dataSize = getDataSize(value);
  }

  /** Return the value. */
  get() {
    if ((this.usage += this._weakCache._opt.lfuIncrease)
      > this._weakCache.lfuMax) {
      this.usage = this._weakCache.lfuMax;
    }
    return this._value;
  }

  /** Decrement the usage counter (used in LFU). */
  doAge() {
    if ((this.usage -= this._weakCache._opt.lfuWeight) < 0) {
      this.usage = 0;
    }
  }
}
