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
