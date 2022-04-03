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
import WeakCache from "@cley_faye/js-weakcache/lib/weakcache/weakcache.js";

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

WeakValueCache
--------------
Keep a list of key→value, but `value` can be garbage collected.
This is similar to `WeakMap` in other languages (JavaScript `WeakMap` behave differently).

A basic algorithm is in place to remove dead keys regularly.

### Usage

```JavaScript
import WeakValueCache from "@cley_faye/js-weakcache/lib/weakvaluecache.js";
```

TimeCache
---------
Set a cache where values expires automatically after a given duration.

### Usage

```JavaScript
import TimeCache from "@cley_faye/js-weakcache/lib/timecache/timecache.js";
```

ProxyCache
----------
A cache that implements automatic fetch of data when there is a cache miss.
Typical usage would be to temporarily cache API results to mimic regular HTTP cache, but with finer
control and less request to a server.

In such case, one would create a `TimeCache` instance with the desired expiration time and use a
`ProxyCache` instance with this cache as the backend, and a function that returns a promise with the
appropriate data.
Subsequent calls to the proxy's `get()` method with the same key would return the same data, as long
as it hasn't expired in the backing cache.

### Usage

```JavaScript
import ProxyCache from "@cley_faye/js-weakcache/lib/proxycache/proxycache.js";
import TimeCache from "@cley_faye/js-weakcache/lib/timecache/timecache.js";

// Function that perform some async data fetching
const getFromAPI = id => fetch(`https://some.api.invalid/${id}`).then(res => res.json());

const cache = new TimeCache({entryDurationInMs: 1000, resetDurationOnGet: true});
const proxy = new ProxyCache(cache, getFromAPI);

// Retrieve data from function through proxy
const value = await proxy.get(34);

// Subsequent calls to proxy will not perform a fetch call as long as the calls are less than 1000ms
// apart, as configured above
const value2 = await proxy.get(34); // Will not trigger the getFromAPI() function call

// Waiting long enough will cause the value to expire from the cache, and trigger a new call
await new Promise(resolve => {
  setTimeout(resolve, 1500);
});

const value3 = await proxy.get(34); // Will trigget a new call from getFromAPI()

// Also, if the cached value is expected to become invalid because of outside action (user, etc.)
// the cache entry can be invalidated/updated

// Invalidate data…
proxy.set(34);

// …or replace data with updated value, if available
proxy.set(34, someNewValue);
```
