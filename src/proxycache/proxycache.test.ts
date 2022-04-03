/* eslint-disable @typescript-eslint/no-magic-numbers */
import assert from "assert";
import {delayPromise} from "../test/utils.test.js";
import TimeCache from "../timecache/timecache.js";
import {KeyType} from "../types.js";
import WeakCache from "../weakcache/weakcache.js";
import ProxyCache from "./proxycache.js";

const getFetchTools = () => {
  const history: Array<string> = [];
  let slow = false;
  const fetch = async (key: KeyType): Promise<number> => {
    if (slow) await delayPromise(500);
    history.push(key.toString());
    const numValue = parseInt((key.toString()).substring("test".length), 10);
    return numValue + 1000;
  };
  const setSlow = (value: boolean): void => {
    slow = value;
  };
  return {
    history,
    fetch,
    setSlow,
  };
};

const testBasic = async () => {
  const cache = new WeakCache<number>();
  const tools = getFetchTools();
  const proxy = new ProxyCache(cache, tools.fetch);
  const val1 = await proxy.get("test1");
  assert(val1 === 1001);
  const val2 = await proxy.get("test2");
  assert(val2 === 1002);
  tools.setSlow(true);
  const val2bis = await proxy.get("test2");
  assert(val2bis === 1002);
  const val3Promise = proxy.get("test3");
  tools.history.push("delay");
  const val3bis = await proxy.get("test3");
  assert(val3bis === 1003);
  const val3 = await val3Promise;
  assert(val3 === 1003);
  const val1bis = await proxy.get("test1");
  assert(val1bis === 1001);
  assert.deepStrictEqual(
    tools.history,
    [
      "test1",
      "test2",
      "delay",
      "test3",
    ],
  );
};

const testBackend = async () => {
  const cache = new TimeCache<number>({entryDurationInMs: 500, resetDurationOnGet: true});
  const tools = getFetchTools();
  const proxy = new ProxyCache(cache, tools.fetch);
  const val1 = await proxy.get("test1");
  assert(val1 === 1001);
  const val2 = await proxy.get("test2");
  assert(val2 === 1002);
  const val1bis = await proxy.get("test1");
  assert(val1bis === 1001);
  const val2bis = await proxy.get("test2");
  assert(val2bis === 1002);
  tools.history.push("delay1");
  await delayPromise(200);
  const val1Three = await proxy.get("test1");
  assert(val1Three === 1001);
  tools.history.push("delay2");
  await delayPromise(200);
  const val1Four = await proxy.get("test1");
  assert(val1Four === 1001);
  tools.history.push("delay3");
  await delayPromise(200);
  const val1Five = await proxy.get("test1");
  assert(val1Five === 1001);
  const val2Three = await proxy.get("test2");
  assert(val2Three === 1002);
  assert.deepStrictEqual(
    tools.history,
    [
      "test1",
      "test2",
      "delay1",
      "delay2",
      "delay3",
      "test2",
    ],
  );
};

describe("ProxyCache", () => {
  it("Basic test", testBasic);
  it("Backend operation", testBackend);
});
