@cley_faye/js-weakcache
=======================
Various cache mechanisms.

Goal
----
Provide some basic key-value cache with various usage conditions.

WeakCache
---------
The `WeakCache` class provide a basic key→value mapping with some level of control on how long
cached entries are kept.
The `maxSize` property from v0 now indicate how many entries are kept, as the "size" mechanic made
little sense and had a large overhead.
The "least frequently used" implementation was also removed, as it was not very good.

### Usage
Construction:

```JavaScript
import WeakCache from "@cley_faye/js-weakcache";

const cache = new WeakCache({
  // Maximum entries count
  maxSize: 64,
});
```

The maximum size dictate when to remove old entries.
The mode specify how old entries are selected for eviction.

A `WeakCache` instance provides two method: `set(key, value)` and `get(key, value)`.
Calling `set()` will write an entry in the cache, eventually clearing old entries, and calling
`get()` will return the current value associated in the cache, or `undefined` if the value is not
set (or was evicted).
