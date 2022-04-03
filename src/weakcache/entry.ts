/** A single cache entry.
 *
 * Remember how recently an entry was used.
 */
export default class Entry<ValueType> {
  public age = 0;
  #value: ValueType;

  /** Create a dangling entry.
   *
   * Entries are created in the "immune" state and can't be removed until
   * removeImmune() is called.
   */
  public constructor(value: ValueType) {
    this.#value = value;
  }

  /** Return the value. */
  public get(): ValueType {
    this.age = 0;
    return this.#value;
  }

  /** Age the entry. Older entries are closer to the exit door. */
  public doAge(): void {
    if (this.age < Number.MAX_SAFE_INTEGER) ++this.age;
  }
}
