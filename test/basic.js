import WeakCache from "../lib/weakcache.js";
import scenario from "./scenario.js";

describe("Basic operations", () => {
  it("Set/get", () => {
    const cache = new WeakCache();
    scenario(
      cache,
      [
        {method: "set", key: "test1", value: 34},
        {method: "get", key: "test1", value: 34},
        {method: "set", key: "test2", value: 35},
        {method: "get", key: "test2", value: 35},
      ],
    );
  });
  it("Get non existent", () => {
    const cache = new WeakCache();
    scenario(
      cache,
      [
        {method: "get", key: "test1", value: undefined},
        {method: "set", key: "test1", value: 34},
        {method: "get", key: "test1", value: 34},
        {method: "get", key: "test2", value: undefined},
      ],
    );
  });
});
