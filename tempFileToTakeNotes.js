//Debounce ----------------

// Pseudocode:
// 1. Store a timerID in closure
// 2. Return a function that:
//    a. Clears the previous timer (resets the wait)
//    b. Starts a new timer
//    c. When timer expires, execute the callback with latest args
// Result: callback only fires after caller stops calling for `delay` ms

function debounce(callbackFunc, delay) {
  let timeoutID;

  return (...args) => {
    clearTimeout(timeoutID);
    timeoutID = setTimeout(() => {
      callbackFunc(...args);
    }, delay);
  };
}

//Throttle -----------------

// Pseudocode (basic - leading edge only):
// 1. Store a throttle flag in closure (starts false)
// 2. Return a function that:
//    a. If throttled, do nothing (exit early)
//    b. Otherwise, execute callback immediately
//    c. Set throttle flag to true (block future calls)
//    d. After `delay` ms, set throttle flag to false (unblock)
// Result: callback fires once immediately, then at most once per `delay` ms

function basicThrottle(callbackFunc, delay) {
  let throttle = false;

  return (...args) => {
    if (throttle) return;

    callbackFunc(...args);

    throttle = true;
    setTimeout(() => {
      throttle = false;
    }, delay);
  };
}

function basicThrottleButTimeBased(callBackFunction, delay) {
  let last = 0;

  return (...args) => {
    let now = new Date().getTime();
    if (now - last < delay) return;

    last = now;
    return callBackFunction(...args);
  };
}

// Pseudocode (basicTrailingThrottle - leading + trailing):
// 1. Store a throttle flag and savedArgs in closure
// 2. Return a function that:
//    a. If throttled, save the latest args and exit early
//    b. Otherwise, execute callback immediately (leading edge)
//    c. Set throttle flag to true
//    d. After `delay` ms:
//       - Set throttle flag to false
//       - If savedArgs exists, execute callback with those args (trailing edge)
// Result: fires immediately on first call AND fires the last call after delay

function basicTrailingThrottle(callbackFunc, delay) {
  let isThrottled = false;
  let lastCall;

  return (...args) => {
    if (isThrottled) {
      lastCall = args;
      return;
    }

    callbackFunc(...args);
    isThrottled = true;

    setTimeout(() => {
      isThrottled = false;
      if (lastCall) {
        callbackFunc(...lastCall);
      }
    }, delay);
  };
}

// Pseudocode (queueThrottle - no calls dropped):
// 1. Store a throttle flag and a queue array in closure
// 2. Define processQueue helper that:
//    a. If queue is empty, set throttle to false and stop
//    b. Otherwise, shift first item from queue, execute callback with it
//    c. Schedule itself again after `delay` ms (recursive drain)
// 3. Return a function that:
//    a. If throttled, push args to queue and exit early
//    b. Otherwise, execute callback immediately (leading edge)
//    c. Set throttle to true
//    d. Schedule processQueue after `delay` ms
// Result: every call executes in order, spaced `delay` ms apart, nothing dropped

function queueThrottle(callbackFunc, delay) {
  let isThrottled = false;
  const callQueue = [];

  function processQueue() {
    if (callQueue.length === 0) {
      isThrottled = false;
      return;
    }

    const args = callQueue.shift();
    callbackFunc(...args);

    setTimeout(() => {
      processQueue();
    }, delay);
  }

  return (...args) => {
    if (isThrottled) {
      callQueue.push(args);
      return;
    }

    callbackFunc(...args);
    isThrottled = true;

    setTimeout(() => {
      processQueue();
    }, delay);
  };
}

//Memoization -----------------

// Memoized Fibbonacci
// Pseudocode (memoizedFib):
// 1. Accept n and a cache array (default empty)
// 2. If cache[n] exists, return it immediately (already computed)
// 3. Base case: if n <= 2, result = 1
// 4. Otherwise, result = memoizedFib(n-1, cache) + memoizedFib(n-2, cache)
// 5. Store result in cache[n]
// 6. Return result
// Result: O(n) time instead of O(2^n) — each subproblem computed only once

function memoizedFib(n, cache = []) {
  console.log(`memoizedFib called with n=${n}, cache=[${cache}]`);
  if (cache[n] !== undefined) return cache[n];

  let result;

  if (n <= 2) {
    return 1;
  } else {
    result = memoizedFib(n - 1, cache) + memoizedFib(n - 2, cache);
  }
  cache[n] = result;
  return result;
}

//General Memoization
//A generic wrapper that adds memoization to any function

// Pseudocode (memoize):
// 1. Create a Map to store cached results in closure
// 2. Return a new function that:
//    a. Generate a cache key (use arg directly if single arg, otherwise JSON.stringify)
//    b. If key exists in cache, return cached result immediately
//    c. Otherwise, call the original function with the args
//    d. Store the result in cache with the key
//    e. Return the result
// Result: wraps any function with automatic caching — repeated calls with same args skip computation

function memoize(fn) {
  const cache = new Map();

  return (...args) => {
    const key = args.length === 1 ? args[0] : JSON.stringify(args);

    if (cache.has(key)) return cache.get(key);

    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

//Deep Clone -----------------

// Pseudocode (basicDeepClone):
// 1. Base case: if value is not an object or is null, return it directly (primitives)
// 2. Handle arrays: if value is an array, map over it and basicDeepClone each element
// 3. Handle objects: create empty object, loop over keys, basicDeepClone each value
// 4. Return the new object
// Result: creates a completely independent copy — no shared references with the original

function basicDeepClone(value) {
  if (value === null || typeof value !== "object") return value;

  if (Array.isArray(value)) {
    return value.map((item) => basicDeepClone(item));
  }

  const clone = {};
  for (const key in value) {
    if (value.hasOwnProperty(key)) {
      clone[key] = basicDeepClone(value[key]);
    }
  }
  return clone;
}

function anotherBasicDeepClone(obj) {
  if (typeof obj !== "object" || obj === null) return obj;

  // Create a new array or object to hold the values
  const newObj = Array.isArray(obj) ? [] : {};

  for (let key in obj) {
    const value = obj[key];

    // recursive call for nested objects and arrays
    newObj[key] = anotherBasicDeepClone(value);
  }

  return newObj;
}

// Advanced Deep Clone

// Pseudocode (advancedDeepClone):
// 1. Base case: if value is null or not an object, return it (primitives)
// 2. Circular reference check: if value is in `seen` WeakMap, return the stored clone
// 3. Handle Date: return new Date with same value
// 4. Handle RegExp: return new RegExp with same source and flags
// 5. Handle Map: create new Map, add to `seen`, deep clone each key and value
// 6. Handle Set: create new Set, add to `seen`, deep clone each value
// 7. Handle Array/Object: create [] or {}, add to `seen`, deep clone each property
// 8. Return the clone
// Result: handles circular refs, Date, RegExp, Map, Set, arrays, and plain objects

function advancedDeepClone(toBeCloned, seen = new WeakMap()) {
  if (toBeCloned === null || typeof toBeCloned !== "object") return toBeCloned;
  if (seen.has(toBeCloned)) return seen.get(toBeCloned);

  if (toBeCloned instanceof Date) return new Date(toBeCloned);
  if (toBeCloned instanceof RegExp)
    return new RegExp(toBeCloned.source, toBeCloned.flags);

  if (toBeCloned instanceof Map) {
    const clonedMap = new Map();
    seen.set(toBeCloned, clonedMap);
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
    toBeCloned.forEach((value) =>
      clonedSet.add(advancedDeepClone(value, seen)),
    );
    return clonedSet;
  }

  const clonedObjorArray = Array.isArray(toBeCloned) ? [] : {};
  seen.set(toBeCloned, clonedObjorArray);

  for (let key of Object.keys(toBeCloned)) {
    clonedObjorArray[key] = advancedDeepClone(toBeCloned[key], seen);
  }
  return clonedObjorArray;
}

//One line Vanilla JS deep clone ------------------
//Doesnt work with dates, functions, undefined, infinity, regExps,
//ModifiedPathsSnapshot, sets, blobs, fileLists, imageDatas, and other complex data types

const obj = {
  name: "Poo",
  nestedObj: {
    name2: "Poo2",
    age: 25,
  },
};
const deepClonedObj = JSON.parse(JSON.stringify(obj));

// Debounced Search Input (with Cache) ----------------

// Pseudocode:
// 1. Create input element and results container
// 2. Create a cache (Map) to store query -> results
// 3. Define debounce utility
// 4. Define search function that:
//    a. If empty query, clear results and return
//    b. If query exists in cache, render cached results and return (skip filtering)
//    c. Otherwise, filter dummy data, store result in cache, render
//    d. If cache exceeds max size, evict oldest entry (simple LRU)
// 5. Attach debounced search to input's 'input' event
// 6. Key points:
//    - Cache avoids redundant computation for repeated queries
//    - LRU eviction prevents unbounded memory growth
//    - Normalize query (lowercase) so "React" and "react" share a cache entry

function createDebouncedSearch() {
  const dummyData = [
    "JavaScript",
    "Java",
    "Python",
    "TypeScript",
    "Ruby",
    "Rust",
    "Go",
    "C++",
    "React",
    "Redux",
    "Redis",
    "Angular",
    "Ansible",
  ];

  const cache = new Map();
  const MAX_CACHE_SIZE = 50;

  const container = document.createElement("div");

  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Search...";

  const results = document.createElement("ul");
  container.append(input, results);

  function debounce(fn, delay) {
    let timeoutID;
    return (...args) => {
      clearTimeout(timeoutID);
      timeoutID = setTimeout(() => fn(...args), delay);
    };
  }

  function search(query) {
    if (!query.trim()) {
      results.innerHTML = "";
      return;
    }

    const normalizedQuery = query.toLowerCase();

    if (cache.has(normalizedQuery)) {
      results.innerHTML = cache.get(normalizedQuery);
      return;
    }

    const filtered = dummyData.filter((item) =>
      item.toLowerCase().includes(normalizedQuery),
    );

    const html = filtered.map((item) => `<li>${item}</li>`).join("");

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

// Interview Follow-ups:
// Q: Why debounce over throttle here?
//    Debounce: fires once AFTER user stops typing.
//    Throttle: fires at intervals DURING typing — causes unnecessary intermediate work.
// Q: Why 300ms? — UX sweet spot; fast typists won't trigger, a pause will.
// Q: How would you handle async API calls instead of local filter?
//    Use AbortController to cancel stale in-flight requests when a new keystroke arrives.
// Q: Why normalize the query before caching?
//    So "React" and "react" hit the same cache entry — avoids duplicate storage.
// Q: Why LRU eviction? — Map preserves insertion order, so deleting the first key
//    removes the oldest entry. Prevents unbounded memory growth.
