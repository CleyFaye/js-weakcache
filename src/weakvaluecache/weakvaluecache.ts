import {Cache, KeyType} from "../types.js";

/**
 * Associate values with keys.
 * Values can be garbage-collected, causing them to be undefined.
 */
export default class WeakValueCache<ValueType extends object> implements Cache<ValueType> {
  #cleanupSteps: number;
  #remainingSteps: number;
  #map = new Map<KeyType, WeakRef<ValueType>>();

  /**
   * Constructor
   *
   * @param cleanupSteps
   * Indicate how often "dead" keys are cleaned up, to avoid memory leak.
   * A value of 0 indicate that everytime a value is added/removed the cleanup is run.
   *
   * Larger values mean cleanup occurs less often, but may use more memory because of the dead keys.
   * Note that if a dead value is "get" (cache miss), the cleanup is triggered.
   */
  public constructor(cleanupSteps = 100) {
    this.#cleanupSteps = cleanupSteps;
    this.#remainingSteps = cleanupSteps;
    if (cleanupSteps < 0) throw new Error("Invalid parameter");
  }

  public get(key: KeyType): ValueType | undefined {
    this.#countStep();
    const ref = this.#map.get(key);
    if (ref === undefined) return;
    const value = ref.deref();
    if (value === undefined) {
      this.#cleanDeadKeys();
    }
    return value;
  }

  public set(key: KeyType, value?: ValueType): void {
    this.#countStep();
    if (value === undefined) {
      if (this.#map.has(key)) this.#map.delete(key);
      return;
    }
    this.#map.set(key, new WeakRef(value));
  }

  #countStep() {
    if (this.#cleanupSteps > 0) --this.#remainingSteps;
    if (this.#remainingSteps <= 0) this.#cleanDeadKeys();
  }

  #cleanDeadKeys() {
    this.#remainingSteps = this.#cleanupSteps;
    const keysToRemove = [];
    for (const [key, ref] of this.#map) {
      if (ref.deref() === undefined) keysToRemove.push(key);
    }
    for (const key of keysToRemove) this.#map.delete(key);
  }
}
