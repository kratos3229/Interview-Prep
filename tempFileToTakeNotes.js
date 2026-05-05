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
