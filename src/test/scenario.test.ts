import assert from "assert";
import {Cache} from "../types.js";
import {delayPromise} from "./utils.test.js";

interface ScenarioEntryData {
  method: "get" | "set";
  key: string;
  value: number | undefined;
}

export interface ScenarioEntryDelay {
  method: "delay";
  durationInMs: number;
}

export interface ScenarioEntryClear {
  method: "clear";
}

export type ScenarioEntry = ScenarioEntryData | ScenarioEntryDelay | ScenarioEntryClear;

export type ScenarioData = Array<ScenarioEntry>;

/** Run a scenario of calls on the given cache object. */
const scenario = async (cache: Cache<number>, scenarioData: ScenarioData): Promise<void> => {
  let step = 0;
  for (const entry of scenarioData) {
    switch (entry.method) {
      case "set":
        cache.set(entry.key, entry.value);
        break;
      case "get":
        assert.equal(cache.get(entry.key), entry.value, `Failed step: ${step}`);
        break;
      case "delay":
        await delayPromise(entry.durationInMs);
        break;
      case "clear":
        cache.clear();
        break;
      default:
        throw new Error("Unexpected state");
    }
    ++step;
  }
};

export default scenario;
