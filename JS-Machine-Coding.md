# JavaScript Concepts & Patterns

A reference guide covering common interview patterns and utility functions — debounce, throttle, memoization, deep cloning, and more.

---

## Table of Contents

- [Debounce](#debounce)
- [Throttle](#throttle)
- [Memoization](#memoization)
- [Deep Clone](#deep-clone)
- [Practical Example: Debounced Search with Cache](#practical-example-debounced-search-with-cache)
- [Flatten an Array](#flatten-an-array)

---

## Debounce

**What it does:** Delays executing a function until the caller has *stopped calling* for a given number of milliseconds. Every new call resets the timer.

**When to use it:** Search inputs, window resize handlers, form validation — anywhere you only care about the *final* action, not every intermediate one.

**The key idea:** Closures. The `timeoutID` lives in the outer function's scope and persists between calls, which is what allows it to be cleared and reset on every invocation.

```js
function debounce(callbackFunc, delay) {
  let timeoutID;

  return (...args) => {
    clearTimeout(timeoutID);       // cancel previous timer on every call
    timeoutID = setTimeout(() => {
      callbackFunc(...args);       // only fires after caller goes quiet for `delay` ms
    }, delay);
  };
}
```

**How it works step by step:**
1. `timeoutID` is stored in the closure — it survives between calls
2. Every call immediately cancels the previous pending timer
3. A fresh timer is started
4. Only when no call arrives for `delay` ms does the timer actually fire

---

## Throttle

Throttle limits how often a function can fire. Unlike debounce (which waits for silence), throttle guarantees the function runs *at most once per interval*.

There are several flavors, each with different tradeoffs:

---

### 1. Basic Flag Throttle (leading edge only)

Fires immediately on the first call, then blocks all calls for `delay` ms.

```js
function basicThrottle(callbackFunc, delay) {
  let throttle = false;

  return (...args) => {
    if (throttle) return;          // blocked — do nothing

    callbackFunc(...args);         // leading edge: fires immediately
    throttle = true;

    setTimeout(() => {
      throttle = false;            // unblock after delay
    }, delay);
  };
}
```

**Tradeoff:** Simple and easy to reason about, but any calls made during the blocked window are silently dropped.

---

### 2. Time-Based Throttle

Instead of a boolean flag, compares timestamps. More precise — not affected by timer drift.

```js
function basicThrottleButTimeBased(callBackFunction, delay) {
  let last = 0;

  return (...args) => {
    let now = new Date().getTime();
    if (now - last < delay) return; // not enough time has passed

    last = now;
    return callBackFunction(...args);
  };
}
```

**When to prefer this:** When you need exact timing guarantees (e.g. game loops, animation frames).

---

### 3. Leading + Trailing Throttle

Fires immediately on the first call (leading edge), AND fires once more after the delay with the *most recent* args if any calls were made during the blocked window.

```js
function basicTrailingThrottle(callbackFunc, delay) {
  let isThrottled = false;
  let lastCall;

  return (...args) => {
    if (isThrottled) {
      lastCall = args;             // save the latest args for the trailing call
      return;
    }

    callbackFunc(...args);         // leading edge
    isThrottled = true;

    setTimeout(() => {
      isThrottled = false;
      if (lastCall) {
        callbackFunc(...lastCall); // trailing edge: fire with the most recent args
      }
    }, delay);
  };
}
```

**When to use this:** When you care about both the *start* and the *end* of a burst — e.g. tracking the first and last scroll position.

**Tradeoff:** Intermediate calls are still dropped. Only the last one is saved.

---

### 4. Queue Throttle (no calls dropped)

Every call is queued and executed in order, spaced `delay` ms apart. Nothing is ever dropped.

```js
function queueThrottle(callbackFunc, delay) {
  let isThrottled = false;
  const callQueue = [];

  function processQueue() {
    if (callQueue.length === 0) {
      isThrottled = false;         // queue drained, open the gate
      return;
    }

    const args = callQueue.shift();
    callbackFunc(...args);

    setTimeout(() => {
      processQueue();              // recursively drain the queue
    }, delay);
  }

  return (...args) => {
    if (isThrottled) {
      callQueue.push(args);        // park it in the queue
      return;
    }

    callbackFunc(...args);         // leading edge
    isThrottled = true;

    setTimeout(() => {
      processQueue();
    }, delay);
  };
}
```

**When to use this:** API rate limiting, bulk operations where every call matters (e.g. logging, analytics events).

**Tradeoff:** Memory grows with the queue. Under a rapid burst, execution can lag far behind real time.

---

### Debounce vs Throttle — Quick Reference

| | Debounce | Throttle |
|---|---|---|
| Fires when | After caller goes *quiet* | At most *once per interval* |
| Good for | Search inputs, resize | Scroll handlers, rate limiting |
| Intermediate calls | Dropped (reset timer) | Dropped (or queued) |
| Guarantees a call | Only after silence | Yes, at least leading edge |

---

## Memoization

**What it is:** Caching the result of a function call so that repeated calls with the same arguments skip the computation entirely and return the cached result.

**The key idea:** Trade memory for speed. Useful when a function is pure (same input always gives same output) and expensive.

---

### Memoized Fibonacci

Without memoization, `fib(n)` has `O(2^n)` time — it recalculates the same subproblems exponentially. With memoization it becomes `O(n)`.

```js
function memoizedFib(n, cache = []) {
  if (cache[n] !== undefined) return cache[n]; // already computed — skip

  let result;
  if (n <= 2) {
    return 1;                                  // base case
  } else {
    result = memoizedFib(n - 1, cache) + memoizedFib(n - 2, cache);
  }

  cache[n] = result;                           // store before returning
  return result;
}
```

The `cache` array is passed down through recursive calls. Once `fib(5)` is computed, any later call to `fib(5)` anywhere in the tree returns instantly.

---

### Generic Memoize Wrapper

A reusable higher-order function that adds memoization to *any* function.

```js
function memoize(fn) {
  const cache = new Map();

  return (...args) => {
    const key = args.length === 1 ? args[0] : JSON.stringify(args);

    if (cache.has(key)) return cache.get(key); // cache hit

    const result = fn(...args);
    cache.set(key, result);                    // store result
    return result;
  };
}
```

**Usage:**
```js
const expensiveAdd = (a, b) => a + b;
const memoizedAdd = memoize(expensiveAdd);

memoizedAdd(1, 2); // computed
memoizedAdd(1, 2); // returned from cache instantly
```

**Key design decisions:**
- Uses a `Map` instead of a plain object — Maps handle any type as a key, not just strings
- For single-arg functions, the arg is used directly as the key (avoids serialization overhead)
- For multi-arg functions, `JSON.stringify` creates a stable composite key

**Limitation:** `JSON.stringify` fails for functions, `undefined`, circular references, and `Symbol` keys.

---

## Deep Clone

A deep clone creates a completely independent copy of an object — no shared references. Mutating the clone does not affect the original.

**Contrast with shallow clone:**
```js
const original = { a: { b: 1 } };
const shallow = { ...original };  // spread = shallow copy
shallow.a.b = 99;
console.log(original.a.b);        // 99 — still linked!
```

---

### Basic Deep Clone

Handles plain objects and arrays recursively.

```js
function basicDeepClone(value) {
  if (value === null || typeof value !== "object") return value; // primitives returned as-is

  if (Array.isArray(value)) {
    return value.map((item) => basicDeepClone(item));            // clone each element
  }

  const clone = {};
  for (const key in value) {
    if (value.hasOwnProperty(key)) {
      clone[key] = basicDeepClone(value[key]);                   // recurse into each property
    }
  }
  return clone;
}
```

Alternative style — same logic, slightly different structure:

```js
function anotherBasicDeepClone(obj) {
  if (typeof obj !== "object" || obj === null) return obj;

  const newObj = Array.isArray(obj) ? [] : {};

  for (let key in obj) {
    newObj[key] = anotherBasicDeepClone(obj[key]); // recursive call for nested values
  }

  return newObj;
}
```

**Limitation:** Neither handles `Date`, `RegExp`, `Map`, `Set`, or circular references.

---

### Advanced Deep Clone

Handles circular references, `Date`, `RegExp`, `Map`, and `Set`.

```js
function advancedDeepClone(toBeCloned, seen = new WeakMap()) {
  if (toBeCloned === null || typeof toBeCloned !== "object") return toBeCloned;

  // Circular reference guard — if we've seen this object before, return its clone
  if (seen.has(toBeCloned)) return seen.get(toBeCloned);

  if (toBeCloned instanceof Date)   return new Date(toBeCloned);
  if (toBeCloned instanceof RegExp) return new RegExp(toBeCloned.source, toBeCloned.flags);

  if (toBeCloned instanceof Map) {
    const clonedMap = new Map();
    seen.set(toBeCloned, clonedMap);  // register BEFORE recursing (prevents infinite loops)
    toBeCloned.forEach((value, key) => {
      clonedMap.set(
        advancedDeepClone(key, seen),
        advancedDeepClone(value, seen),
      );
    });
    return clonedMap;
  }

  if (toBeCloned instanceof Set) {
    const clonedSet = new Set();
    seen.set(toBeCloned, clonedSet);
    toBeCloned.forEach((value) => clonedSet.add(advancedDeepClone(value, seen)));
    return clonedSet;
  }

  const clonedObjorArray = Array.isArray(toBeCloned) ? [] : {};
  seen.set(toBeCloned, clonedObjorArray);

  for (let key of Object.keys(toBeCloned)) {
    clonedObjorArray[key] = advancedDeepClone(toBeCloned[key], seen);
  }
  return clonedObjorArray;
}
```

**Why `WeakMap` for `seen`?**
- `WeakMap` keys are object references — perfect for tracking "have I seen this exact object?"
- `WeakMap` doesn't prevent garbage collection (unlike a regular `Map`), so there's no memory leak

**Why register the clone in `seen` BEFORE recursing?**
- If object A has a property pointing back to itself (circular), recursing without registering first would cause infinite recursion
- By storing the (empty) clone first, the circular lookup returns the in-progress clone instead of looping

---

### One-liner: `JSON.parse(JSON.stringify(obj))`

```js
const obj = {
  name: "Poo",
  nestedObj: { name2: "Poo2", age: 25 },
};

const deepClonedObj = JSON.parse(JSON.stringify(obj));
```

**Works fine for:** plain objects and arrays with string/number/boolean/null values.

**Silently breaks with:** `Date` (converted to string), `undefined` (dropped), `Infinity`/`NaN` (become `null`), functions (dropped), `RegExp` (becomes `{}`), `Map`, `Set`, circular references (throws).

---

### Deep Clone — Which to Use?

| Approach | Handles Dates/RegExp/Map/Set | Handles Circular Refs | Notes |
|---|---|---|---|
| `JSON.parse/stringify` | No | No (throws) | Fine for simple data |
| `basicDeepClone` | No | No (infinite loop) | Good for nested plain objects |
| `advancedDeepClone` | Yes | Yes | Use this for real-world data |
| `structuredClone()` | Yes (built-in) | Yes | Modern browser/Node API — prefer this |

> **Tip:** In modern JavaScript (Node 17+, all modern browsers), use the built-in `structuredClone(obj)` instead of writing your own.

---

## Practical Example: Debounced Search with Cache

Combines debounce, memoization, and DOM manipulation into a real feature.

**What it does:** An input that filters a list. It debounces the search (waits for the user to pause typing) and caches results so repeated queries skip the filter logic entirely.

```js
function createDebouncedSearch() {
  const dummyData = [
    "JavaScript", "Java", "Python", "TypeScript",
    "Ruby", "Rust", "Go", "C++",
    "React", "Redux", "Redis", "Angular", "Ansible",
  ];

  const cache = new Map();
  const MAX_CACHE_SIZE = 50;

  // --- DOM setup ---
  const container = document.createElement("div");
  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Search...";
  const results = document.createElement("ul");
  container.append(input, results);

  // --- Debounce utility ---
  function debounce(fn, delay) {
    let timeoutID;
    return (...args) => {
      clearTimeout(timeoutID);
      timeoutID = setTimeout(() => fn(...args), delay);
    };
  }

  // --- Search logic ---
  function search(query) {
    if (!query.trim()) {
      results.innerHTML = "";
      return;
    }

    const normalizedQuery = query.toLowerCase(); // "React" and "react" share one cache entry

    if (cache.has(normalizedQuery)) {
      results.innerHTML = cache.get(normalizedQuery); // cache hit — skip filtering
      return;
    }

    const filtered = dummyData.filter((item) =>
      item.toLowerCase().includes(normalizedQuery),
    );
    const html = filtered.map((item) => `<li>${item}</li>`).join("");

    // Simple LRU eviction: Map preserves insertion order, so the first key is the oldest
    if (cache.size >= MAX_CACHE_SIZE) {
      const oldestKey = cache.keys().next().value;
      cache.delete(oldestKey);
    }

    cache.set(normalizedQuery, html);
    results.innerHTML = html;
  }

  const debouncedSearch = debounce(search, 300);

  input.addEventListener("input", (e) => {
    debouncedSearch(e.target.value);
  });

  document.body.appendChild(container);
}
```

### Interview Follow-up Q&A

**Q: Why debounce over throttle here?**
Debounce fires once *after* the user stops typing — exactly what you want. Throttle fires at intervals *during* typing, causing unnecessary intermediate searches.

**Q: Why 300ms?**
A UX sweet spot. Fast typists won't trigger false searches, but a natural pause will. Commonly used in production search UIs.

**Q: How would you handle real async API calls instead of local filtering?**
Use `AbortController` to cancel stale in-flight requests when a new keystroke arrives:
```js
let controller;
async function search(query) {
  if (controller) controller.abort();
  controller = new AbortController();
  const res = await fetch(`/api/search?q=${query}`, { signal: controller.signal });
  // ...
}
```

**Q: Why normalize the query before caching?**
So `"React"` and `"react"` hit the same cache entry — avoids duplicate storage for the same effective query.

**Q: Why LRU eviction?**
`Map` preserves insertion order, so `cache.keys().next().value` always returns the oldest entry. Deleting it keeps memory bounded.

---

## Flatten an Array

Flattens a nested array up to `n` levels deep.

```js
function flattenNestedArray(array = [], n = 1) {
  let result = [];

  function helper(arr, depth) {
    for (const val of arr) {
      if (Array.isArray(val) && depth < n) {
        helper(val, depth + 1); // go deeper only if we haven't hit the depth limit
      } else {
        result.push(val);       // either not an array, or we've hit max depth
      }
    }
  }

  helper(array, 0);
  return result;
}
```

**Examples:**
```js
flattenNestedArray([1, [2, [3, [4]]]], 1); // [1, 2, [3, [4]]]
flattenNestedArray([1, [2, [3, [4]]]], 2); // [1, 2, 3, [4]]
flattenNestedArray([1, [2, [3, [4]]]], Infinity); // [1, 2, 3, 4]
```

**How it works:**
- An inner `helper` function carries `depth` as it recurses
- If the current item is an array AND we haven't reached `n` levels yet, recurse one level deeper
- Otherwise, push the value directly into `result`

**Built-in alternative:**
```js
[1, [2, [3]]].flat(1);        // [1, 2, [3]]
[1, [2, [3]]].flat(Infinity); // [1, 2, 3]
```

> In interviews, implementing it manually (like above) demonstrates understanding of recursion and depth tracking. Mentioning `.flat()` shows practical JS knowledge.
