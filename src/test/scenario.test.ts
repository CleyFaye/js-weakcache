import assert from "assert";
import WeakCache from "../weakcache/weakcache.js";

export interface ScenarioEntry {
  method: "get" | "set";
  key: string;
  value: number | undefined;
}

export type ScenarioData = Array<ScenarioEntry>;

/** Run a scenario of calls on the given cache object. */
const scenario = (cache: WeakCache<number>, scenarioData: ScenarioData): void => {
  let step = 0;
  for (const entry of scenarioData) {
    switch (entry.method) {
      case "set":
        cache.set(entry.key, entry.value);
        break;
      case "get":
        assert.equal(cache.get(entry.key), entry.value, `Failed step: ${step}`);
        break;
      default:
        throw new Error("Unexpected state");
    }
    ++step;
  }
};

export default scenario;
