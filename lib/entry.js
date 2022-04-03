/** A single cache entry.
 *
 * Remember how recently an entry was used.
 */
export default class Entry {
  /** Create a dangling entry.
   *
   * Entries are created in the "immune" state and can't be removed until
   * removeImmune() is called.
   */
  constructor(value) {
    this._value = value;
    this.age = 0;
  }

  /** Return the value. */
  get() {
    this.age = 0;
    return this._value;
  }

  /** Age the entry. Older entries are closer to the exit door. */
  doAge() {
    if (this.age < Number.MAX_SAFE_INTEGER) ++this.age;
  }
}
