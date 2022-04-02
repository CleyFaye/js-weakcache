@cley_faye/js-weakcache
=======================
Cache system sort of similar to WeakMap but with some behavior control

Goal
----
Have a controlled temporary cache; we do not want the GC to be able to remove values before a
certain threshold is reached.
This class implement a basic key-value mapping.

Usage
-----

### Construction
When creating a WeakCache instance some options can be provided to customize its behavior:

```JavaScript
import WeakCache from "@cley_faye/js-weakcache";

const cache = new WeakCache({
  maxSize: 64*1024*1024,   // Maximum data size, in bytes
  mode: WeakCache.modeLFU, // Cleanup mode
  lfuWeight: 0.1,          // Usage weight for LFU mode
});
```

The maximum size dictate when to remove old entries.
The mode specify how old entries are selected for eviction.

### Setter and Getter
A WeakCache instance provides two method: `set(key, value)` and `get(key, value)`.
Calling `set()` will write an entry in the cache, eventually clearing old entries, and calling
`get()` will return the current value associated in the cache, or `undefined` if the value is not
set (or was evicted).

Mode of operation
-----------------

### LRU (Least Recently Used)
The key that were read the least recently are discarded until the cache size is under the allowed
size.

### LFU (Least Frequently Used)
This class implement a basic LFU algorithm; each time a value is read, a counter increase for this
value and decrease for all others. The increase/decrease ratio is controlled by the `lfuWeight`
option.
Values with the lowest counter value are evicted first when required.

Issues and miscelaneous
-----------------------

### Data size
The total data size is computed using JSON serialization, meaning it will be a bit larger than the
effective required space for a given value.
On the other hand, the JavaScript overhead associated with managing these structures is not taken
into account.

As such, the maximum size provided is a rough estimate of how much data can be stored and not an
exact value.

### Going over the maximum cache size
The cache will temporarily go over the maximum size during the eviction algorithm.
This is not really an issue, since the object stored in the cache already exist and do not cause
more memory usage (aside from very small management structures), but technically at some point the
cache "reported" size happens to be higher than the maximum.

### Efficiency and performances
This class provides a way to control how much data can be stored before cleaning.
In some cases it might be possible to use native alternatives (like WeakMap).
If possible, this will probably be better in term of performances.
