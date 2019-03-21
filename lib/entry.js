/*eslint-env node */
const maxUsage = 10000;
const usageInitial = 1;
const usageIncrease = 1;

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
  constructor(value, cache) {
    this._value = value;
    this._weakCache = cache;
    this._usage = usageInitial;
    this._dataSize = Buffer.from(JSON.stringify(value)).length;
    this._immune = true;
  }

  removeImmune() {
    this._immune = false;
  }

  isImmune() {
    return this._immune;
  }

  /** Return the value. */
  get() {
    if ((this._usage += usageIncrease) > maxUsage) {
      this._usage = maxUsage;
    }
    return this._value;
  }

  /** Decrement the usage counter (used in LFU). */
  doAge() {
    if ((this._usage -= this._weakCache._lfuWeight) < 0) {
      this._usage = 0;
    }
  }

  /** Return the current usage value */
  getAge() {
    return this._usage;
  }

  getDataSize() {
    return this._dataSize;
  }
}
