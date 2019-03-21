/*eslint-env node */
const maxUsage = 10000;
const usageInitial = 1;
const usageIncrease = 1;

/** A single cache entry */
export default class Entry {
  constructor(value, cache) {
    this._value = value;
    this._weakCache = cache;
    this._usage = usageInitial;
    this._dataSize = Buffer.from(JSON.stringify(value)).length;
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
