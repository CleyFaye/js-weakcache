import assert from "assert";
import WeakCache from "../weakcache/weakcache";

export interface ScenarioEntry {
  method: "get" | "set";
  key: string;
  value: unknown;
}

export type ScenarioData = Array<ScenarioEntry>;

/** Run a scenario of calls on the given cache object. */
const scenario = (cache: WeakCache, scenarioData: ScenarioData): void => {
  scenarioData.forEach(entry => {
    switch (entry.method) {
      case "set":
        cache.set(entry.key, entry.value);
        break;
      case "get":
        assert.equal(cache.get(entry.key), entry.value);
        break;
      default:
        throw new Error("Unexpected state");
    }
  });
};

export default scenario;
