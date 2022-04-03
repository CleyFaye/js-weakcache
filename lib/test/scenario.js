import assert from "assert";

/** Run a scenario of calls on the given cache object.
 *
 * @param {WeakCache} cache
 *
 * @param {Object[]} scenarioArray
 * A list of "scene" to play on the cache object
 *
 * @param {Object} scenarioArray[]
 * @param {string} scenario[].method
 * @param {string} scenario[].key
 * @param {?Object} scenario[].value
 * Either the value to set (for set()) or the value to expect (for get())
 */
const scenario = (cache, scenarioArray) => {
  scenarioArray.forEach(scene => {
    switch (scene.method) {
    case "set":
      cache.set(scene.key, scene.value);
      break;
    case "get":
      assert.equal(cache.get(scene.key), scene.value);
      break;
    default:
      throw new Error(`Unexpected scene method: ${scene.method}`);
    }
  });
};

export default scenario;
