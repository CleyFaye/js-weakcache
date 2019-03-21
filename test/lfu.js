/*eslint-env mocha */
import WeakCache from "../lib/weakcache";
import scenario from "./scenario";

describe("Checking LFU algorithm", () => {
  it("Basic removal", () => {
    const cache = new WeakCache({maxSize: 10, mode: WeakCache.modeLFU});
    scenario(cache,
      [
        { method: "set", key: "test1", value: 34 },
        { method: "set", key: "test2", value: 35 },
        { method: "set", key: "test3", value: 36 },
        { method: "set", key: "test4", value: 37 },
        { method: "set", key: "test5", value: 38 },
        { method: "set", key: "test6", value: 63 },
        { method: "get", key: "test1", value: undefined },
        { method: "get", key: "test2", value: 35 },
        { method: "get", key: "test3", value: 36 },
        { method: "get", key: "test4", value: 37 },
        { method: "get", key: "test5", value: 38 },
        { method: "get", key: "test6", value: 63 },
      ]);
  });
  it("Weight test2", () => {
    const cache = new WeakCache({maxSize: 10, mode: WeakCache.modeLFU});
    scenario(cache,
      [
        { method: "set", key: "test1", value: 34 },
        { method: "set", key: "test2", value: 35 },
        { method: "get", key: "test2", value: 35 },
        { method: "get", key: "test2", value: 35 },
        { method: "get", key: "test2", value: 35 },
        { method: "get", key: "test2", value: 35 },
        { method: "set", key: "test3", value: 36 },
        { method: "set", key: "test4", value: 37 },
        { method: "set", key: "test5", value: 38 },
        { method: "set", key: "test1", value: 1664 },
        { method: "set", key: "test6", value: 63 },
        { method: "get", key: "test1", value: 1664 },
        { method: "get", key: "test2", value: 35 },
        { method: "get", key: "test3", value: undefined },
        { method: "get", key: "test4", value: undefined },
        { method: "get", key: "test5", value: 38 },
        { method: "get", key: "test6", value: 63 },
      ]);
  });
  it("Lots of removal (unweighted)", () => {
    const cache = new WeakCache({maxSize: 10, mode: WeakCache.modeLFU});
    scenario(cache,
      [
        { method: "set", key: "test1", value: 34 },
        { method: "set", key: "test2", value: 35 },
        { method: "set", key: "test3", value: 36 },
        { method: "set", key: "test4", value: 37 },
        { method: "set", key: "test5", value: 38 },
        { method: "set", key: "test6", value: 101 },
        { method: "set", key: "test7", value: 102 },
        { method: "set", key: "test8", value: 103 },
        { method: "set", key: "test9", value: 104 },
        { method: "set", key: "test10", value: 105 },
        { method: "set", key: "test11", value: 106 },
        { method: "get", key: "test1", value: undefined },
        { method: "get", key: "test2", value: undefined },
        { method: "get", key: "test3", value: undefined },
        { method: "get", key: "test4", value: undefined },
        { method: "get", key: "test5", value: undefined },
        { method: "get", key: "test6", value: undefined },
        { method: "get", key: "test7", value: undefined },
        { method: "get", key: "test8", value: undefined },
        { method: "get", key: "test9", value: 104 },
        { method: "get", key: "test10", value: 105 },
        { method: "get", key: "test11", value: 106 },
      ]);
  });
  it("Lots of removal (weighted)", () => {
    const cache = new WeakCache({maxSize: 10, mode: WeakCache.modeLFU});
    scenario(cache,
      [
        { method: "set", key: "test1", value: 34 },
        { method: "set", key: "test2", value: 35 },
        { method: "set", key: "test3", value: 36 },
        { method: "set", key: "test4", value: 37 },
        { method: "set", key: "test5", value: 38 },
        { method: "get", key: "test3", value: 36 },
        { method: "get", key: "test4", value: 37 },
        { method: "get", key: "test3", value: 36 },
        { method: "get", key: "test4", value: 37 },
        { method: "get", key: "test3", value: 36 },
        { method: "get", key: "test4", value: 37 },
        { method: "get", key: "test3", value: 36 },
        { method: "get", key: "test4", value: 37 },
        { method: "get", key: "test3", value: 36 },
        { method: "get", key: "test4", value: 37 },
        { method: "get", key: "test3", value: 36 },
        { method: "get", key: "test4", value: 37 },
        { method: "get", key: "test3", value: 36 },
        { method: "get", key: "test4", value: 37 },
        { method: "set", key: "test6", value: 101 },
        { method: "set", key: "test7", value: 102 },
        { method: "set", key: "test8", value: 103 },
        { method: "set", key: "test9", value: 104 },
        { method: "set", key: "test10", value: 105 },
        { method: "set", key: "test11", value: 106 },
        { method: "get", key: "test1", value: undefined },
        { method: "get", key: "test2", value: undefined },
        { method: "get", key: "test3", value: 36 },
        { method: "get", key: "test4", value: 37 },
        { method: "get", key: "test5", value: undefined },
        { method: "get", key: "test6", value: undefined },
        { method: "get", key: "test7", value: undefined },
        { method: "get", key: "test8", value: undefined },
        { method: "get", key: "test9", value: undefined },
        { method: "get", key: "test10", value: 105 },
        { method: "get", key: "test11", value: 106 },
      ]);
  });
});
