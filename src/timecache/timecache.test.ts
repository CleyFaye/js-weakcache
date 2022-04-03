/* eslint-disable @typescript-eslint/no-magic-numbers */

import scenario from "../test/scenario.test.js";
import TimeCache from "./timecache.js";

const testBasic = async () => {
  const cache = new TimeCache<number>();
  await scenario(
    cache,
    [
      {method: "set", key: "test1", value: 34},
      {method: "get", key: "test1", value: 34},
      {method: "set", key: "test2", value: 35},
      {method: "get", key: "test2", value: 35},
    ],
  );
};

const testExpire = async () => {
  const cache = new TimeCache<number>({
    entryDurationInMs: 500,
    resetDurationOnGet: false,
  });
  await scenario(
    cache,
    [
      {method: "set", key: "test1", value: 34},
      {method: "set", key: "test2", value: 35},
      {method: "delay", durationInMs: 600},
      {method: "set", key: "test3", value: 36},
      {method: "get", key: "test1", value: undefined},
      {method: "get", key: "test2", value: undefined},
      {method: "get", key: "test3", value: 36},
      {method: "delay", durationInMs: 250},
      {method: "get", key: "test3", value: 36},
      {method: "delay", durationInMs: 250},
      {method: "get", key: "test3", value: undefined},
      {method: "set", key: "test4", value: 37},
      {method: "delay", durationInMs: 250},
      {method: "get", key: "test3", value: undefined},
      {method: "get", key: "test4", value: 37},
    ],
  );
};

const testRefresh = async () => {
  const cache = new TimeCache<number>({
    entryDurationInMs: 500,
    resetDurationOnGet: true,
  });
  await scenario(
    cache,
    [
      {method: "set", key: "test1", value: 34},
      {method: "set", key: "test2", value: 35},
      {method: "delay", durationInMs: 600},
      {method: "set", key: "test3", value: 36},
      {method: "get", key: "test1", value: undefined},
      {method: "get", key: "test2", value: undefined},
      {method: "get", key: "test3", value: 36},
      {method: "delay", durationInMs: 250},
      {method: "get", key: "test3", value: 36},
      {method: "delay", durationInMs: 250},
      {method: "get", key: "test3", value: 36},
      {method: "set", key: "test4", value: 37},
      {method: "delay", durationInMs: 250},
      {method: "get", key: "test3", value: 36},
      {method: "get", key: "test4", value: 37},
    ],
  );
};

const testClear = async () => {
  const cache = new TimeCache<number>({
    entryDurationInMs: 500,
    resetDurationOnGet: true,
  });
  await scenario(
    cache,
    [
      {method: "set", key: "test1", value: 34},
      {method: "set", key: "test2", value: 35},
      {method: "clear"},
      {method: "set", key: "test2", value: 36},
      {method: "set", key: "test3", value: 37},
      {method: "get", key: "test1", value: undefined},
      {method: "get", key: "test2", value: 36},
      {method: "get", key: "test3", value: 37},
    ],
  );
};

describe("TimeCache", () => {
  it("Work as cache", testBasic);
  it("Expires as expected", testExpire).timeout(3000);
  it("Refresh as expected", testRefresh).timeout(5000);
  it("Clear", testClear);
});
