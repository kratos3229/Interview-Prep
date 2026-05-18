// ============================================================
// PROMISES — CORE CONCEPT
// ============================================================
//
// A Promise is an object representing the eventual completion (or failure)
// of an asynchronous operation. Think of it like an IOU note:
// "I promise to give you a value later — either a result or an error."
//
// A Promise is always in one of three states:
//   - PENDING   → initial state, operation hasn't finished yet
//   - FULFILLED → operation completed successfully, resolve() was called
//   - REJECTED  → operation failed, reject() was called
//
// Once a promise settles (fulfilled or rejected) it NEVER changes state again.
//
// Syntax:
//   new Promise((resolve, reject) => {
//     // do async work...
//     resolve(value);  // call this on success
//     reject(reason);  // call this on failure
//   })
//
// The function passed to new Promise() is called the "executor" — it runs
// immediately and synchronously when the promise is created.

let p = new Promise((resolve, reject) => {
  let a = 1 + 1;
  if (a == 2) {
    resolve("Success"); // fulfilled — passes "Success" to .then()
  } else {
    reject("Failed");   // rejected  — passes "Failed" to .catch()
  }
});

// .then() runs when the promise is FULFILLED
// .catch() runs when the promise is REJECTED
//
// Both .then() and .catch() return NEW promises, which is what allows chaining:
//   p.then(...).then(...).catch(...)
//
// The `message` parameter below receives whatever was passed to resolve/reject.

p.then((message) => {
  console.log("This is in the then " + message);
}).catch((message) => {
  console.log("This is in the catch " + message);
});

// ============================================================
// PROMISE COMBINATORS — running multiple promises together
// ============================================================
//
// Real apps rarely run just one async operation. The Promise static methods
// below let you coordinate multiple promises in different ways.

// These three promises resolve immediately (synchronously in this example),
// but in practice they'd represent async work: API calls, file reads, etc.
const recordVideoOne = new Promise((resolve, reject) => {
  resolve("Video 1 recorded");
});

const recordVideoTwo = new Promise((resolve, reject) => {
  resolve("Video 2 recorded");
});

const recordVideoThree = new Promise((resolve, reject) => {
  resolve("Video 3 recorded");
});

// ============================================================
// Promise.all()
// ============================================================
//
// Runs all promises IN PARALLEL and waits for ALL of them to fulfill.
// Resolves with an array of all results, in the same order as the input.
//
// FAIL-FAST: if ANY promise rejects, Promise.all() immediately rejects
// with that error — the other promises are ignored (they still run, but
// their results are discarded).
//
// Use when: you need ALL results and the tasks are independent of each other.
// Example: load a user's profile, posts, and followers at the same time.

Promise.all([recordVideoOne, recordVideoTwo, recordVideoThree]).then(
  (messages) => {
    console.log(messages);
    // logs: ["Video 1 recorded", "Video 2 recorded", "Video 3 recorded"]
    // Order matches the input array, regardless of which resolved first.
  },
);

// ============================================================
// Promise.allSettled()
// ============================================================
//
// Like Promise.all(), but NEVER rejects early.
// Waits for every promise to settle (fulfill OR reject), then resolves
// with an array of result objects describing each outcome.
//
// Each result object looks like:
//   { status: "fulfilled", value: "..." }   — for resolved promises
//   { status: "rejected",  reason: "..." }  — for rejected promises
//
// Use when: you want to know the outcome of every promise, even if some fail.
// Example: sending notifications to multiple users — you want to log which
// ones succeeded and which ones failed, not bail on the first failure.

// Promise.allSettled([recordVideoOne, recordVideoTwo, recordVideoThree]).then(
//   (results) => {
//     results.forEach((result) => {
//       if (result.status === "fulfilled") {
//         console.log("Success:", result.value);
//       } else {
//         console.log("Failed:", result.reason);
//       }
//     });
//   }
// );

// ============================================================
// Promise.race()
// ============================================================
//
// Resolves (or rejects) as soon as the FIRST promise settles — whichever
// wins the race, whether it fulfilled or rejected.
// The other promises are ignored after that.
//
// Use when: you want the fastest result, or want to implement a timeout.
//
// Classic timeout pattern:
//   const timeout = new Promise((_, reject) =>
//     setTimeout(() => reject("Timed out!"), 5000)
//   );
//   Promise.race([fetchData(), timeout]).then(...).catch(...);
//   → if fetchData() takes more than 5s, the timeout wins and rejects

// Promise.race([recordVideoOne, recordVideoTwo, recordVideoThree]).then(
//   (message) => {
//     console.log(message); // logs the result of whichever resolved first
//   }
// );

// ============================================================
// Promise.any()
// ============================================================
//
// Resolves as soon as the FIRST promise FULFILLS (ignores rejections).
// Only rejects if ALL promises reject — throws AggregateError in that case.
//
// Contrast with Promise.race():
//   - race() → first to SETTLE (win = resolve OR reject)
//   - any()  → first to FULFILL (skips over rejections)
//
// Use when: you have multiple sources (e.g. multiple CDN endpoints) and
// want the fastest successful one, ignoring failures.

// Promise.any([recordVideoOne, recordVideoTwo, recordVideoThree]).then(
//   (message) => {
//     console.log(message); // first one to successfully resolve
//   }
// );

// ============================================================
// QUICK COMPARISON TABLE
// ============================================================
//
//  Method               | Resolves when          | Rejects when
// ----------------------|------------------------|---------------------------
//  Promise.all()        | ALL fulfill            | ANY rejects (fail-fast)
//  Promise.allSettled() | ALL settle             | Never (always resolves)
//  Promise.race()       | FIRST settles          | FIRST rejects (if it loses)
//  Promise.any()        | FIRST fulfills         | ALL reject (AggregateError)
//

// ============================================================
// ASYNC / AWAIT — syntactic sugar over Promises
// ============================================================
//
// async/await is NOT a different system — it's cleaner syntax for working
// with Promises. Under the hood, it still uses Promises.
//
// Rules:
//   - "async" before a function makes it always return a Promise
//   - "await" pauses execution inside that function until the Promise settles
//   - "await" can only be used INSIDE an async function
//
// Error handling: use try/catch instead of .catch()

// async function recordAllVideos() {
//   try {
//     // await pauses here until all three promises resolve
//     const results = await Promise.all([
//       recordVideoOne,
//       recordVideoTwo,
//       recordVideoThree,
//     ]);
//     console.log(results);
//   } catch (error) {
//     console.error("Something failed:", error);
//   }
// }
//
// recordAllVideos();

// ============================================================
// .finally()
// ============================================================
//
// Runs after a promise settles, regardless of whether it fulfilled or rejected.
// Does NOT receive the resolved value or rejection reason.
// Use it for cleanup work that must always happen (hiding a spinner, closing a DB connection).
//
// p.then((val) => console.log(val))
//   .catch((err) => console.error(err))
//   .finally(() => console.log("Always runs — hide the loading spinner here"));

// ============================================================
// PROMISE CHAINING
// ============================================================
//
// Each .then() returns a NEW promise whose value is whatever you return
// from the callback. This lets you transform values step by step.

// fetch("/api/user")
//   .then((response) => response.json())          // step 1: parse JSON
//   .then((user) => fetch(`/api/posts/${user.id}`)) // step 2: use result to make another request
//   .then((response) => response.json())           // step 3: parse that response
//   .then((posts) => console.log(posts))           // step 4: use final data
//   .catch((err) => console.error(err));           // one catch handles ALL steps above

// ============================================================
// COMMON GOTCHA: Forgetting to return in a .then()
// ============================================================
//
// If you forget `return` in a .then(), the next .then() receives `undefined`.
//
// WRONG:
//   .then((user) => { fetch(`/api/posts/${user.id}`) })  // no return!
//   .then((posts) => console.log(posts))                  // posts is undefined
//
// CORRECT:
//   .then((user) => fetch(`/api/posts/${user.id}`))      // implicitly returned
//   .then((posts) => console.log(posts))                  // posts is the response
