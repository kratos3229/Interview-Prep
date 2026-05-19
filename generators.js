// ============================================================
// GENERATORS & ITERATORS - JavaScript Interview Prep
// ============================================================

// KEY CONCEPTS:
// - A generator is a function that can be paused and resumed
// - Declared with function* syntax (the asterisk)
// - Uses `yield` to pause execution and emit a value
// - Returns an iterator object with a .next() method
// - Each .next() call resumes execution until the next yield
// - .next() returns { value: <yielded value>, done: <boolean> }
// - Generators are lazy — they compute values on demand, not upfront
// - They implement both the Iterable and Iterator protocols

// ============================================================
// 1. BASIC GENERATOR
// ============================================================

function* simpleGenerator() {
  console.log("Before 1");

  yield 1;
  console.log("After 1");

  console.log("Before 2");
  yield 2;
  console.log("After 2");

  console.log("Before 3");
  yield 3;
  console.log("After 3");
}

const generatorObject = simpleGenerator(); // nothing prints yet — generator is paused at start

console.log(generatorObject.next()); // Before 1 → {value: 1, done: false}
console.log(generatorObject.next()); // After 1  Before 2 → {value: 2, done: false}
console.log(generatorObject.next()); // After 2  Before 3 → {value: 3, done: false}
console.log(generatorObject.next()); // After 3 → {value: undefined, done: true}

// Each call to simpleGenerator() creates a NEW independent iterator
const generatorObject2 = simpleGenerator();
// generatorObject2 starts fresh — completely independent of generatorObject

// ============================================================
// 2. PASSING VALUES INTO A GENERATOR via .next(arg)
// ============================================================
// The argument passed to .next(arg) becomes the result of the yield expression
// The FIRST .next() call cannot pass a value in (there's no yield waiting to receive it)

function* conversation() {
  const name = yield "What is your name?";
  const color = yield `Hello ${name}! What's your favorite color?`;
  return `${name} likes ${color}`;
}

const talk = conversation();
console.log(talk.next());          // {value: "What is your name?", done: false}
console.log(talk.next("Alice"));   // {value: "Hello Alice! What's your favorite color?", done: false}
console.log(talk.next("blue"));    // {value: "Alice likes blue", done: true}

// ============================================================
// 3. THE ITERATOR PROTOCOL
// ============================================================
// An object is an iterator if it has a .next() method that returns {value, done}
// An object is iterable if it has a [Symbol.iterator]() method that returns an iterator
// Generators automatically satisfy BOTH protocols

// Manual iterator (without generators):
const manualIterator = {
  current: 0,
  last: 3,
  next() {
    if (this.current <= this.last) {
      return { value: this.current++, done: false };
    }
    return { value: undefined, done: true };
  }
};

// Same thing with a generator (much cleaner):
function* rangeGenerator(start, end) {
  for (let i = start; i <= end; i++) {
    yield i;
  }
}

// ============================================================
// 4. GENERATORS ARE ITERABLE — work with for...of, spread, destructuring
// ============================================================

function* fibonacci() {
  let prev = 0, curr = 1;
  while (true) {
    yield curr;
    [prev, curr] = [curr, prev + curr];
  }
}

// for...of (automatically calls .next() and stops when done: true)
for (const num of rangeGenerator(1, 5)) {
  console.log(num); // 1, 2, 3, 4, 5
}

// Spread operator
const firstFive = [...rangeGenerator(1, 5)]; // [1, 2, 3, 4, 5]

// Destructuring
const [a, b, c] = fibonacci(); // a=1, b=1, c=2

// Array.from
const arr = Array.from(rangeGenerator(10, 15)); // [10, 11, 12, 13, 14, 15]

// ============================================================
// 5. INFINITE SEQUENCES (lazy evaluation)
// ============================================================
// Generators can represent infinite sequences because they're lazy

function* naturalNumbers() {
  let n = 1;
  while (true) {
    yield n++;
  }
}

function* take(n, iterable) {
  let count = 0;
  for (const item of iterable) {
    if (count >= n) return;
    yield item;
    count++;
  }
}

console.log([...take(5, naturalNumbers())]); // [1, 2, 3, 4, 5]

// ============================================================
// 6. yield* — DELEGATING TO ANOTHER GENERATOR
// ============================================================
// yield* delegates to another iterable/generator

function* innerGen() {
  yield "a";
  yield "b";
}

function* outerGen() {
  yield 1;
  yield* innerGen(); // delegates to innerGen
  yield 2;
}

console.log([...outerGen()]); // [1, "a", "b", 2]

// yield* also works with any iterable (arrays, strings, etc.)
function* flatten(arr) {
  for (const item of arr) {
    if (Array.isArray(item)) {
      yield* flatten(item); // recursive flattening
    } else {
      yield item;
    }
  }
}

console.log([...flatten([1, [2, [3, 4]], 5])]); // [1, 2, 3, 4, 5]

// ============================================================
// 7. GENERATOR .return() and .throw()
// ============================================================

// .return(value) — forces the generator to finish
function* stoppable() {
  yield 1;
  yield 2;
  yield 3;
}
const gen = stoppable();
console.log(gen.next());       // {value: 1, done: false}
console.log(gen.return(99));   // {value: 99, done: true} — generator is done
console.log(gen.next());       // {value: undefined, done: true}

// .throw(error) — throws an error inside the generator at the yield point
function* errorHandler() {
  try {
    const val = yield "waiting...";
  } catch (e) {
    console.log("Caught:", e.message);
  }
}
const eh = errorHandler();
eh.next();                          // {value: "waiting...", done: false}
eh.throw(new Error("oops!"));      // Caught: oops!

// ============================================================
// 8. MAKING ANY OBJECT ITERABLE with Symbol.iterator
// ============================================================

const playlist = {
  songs: ["Song A", "Song B", "Song C"],
  [Symbol.iterator]: function* () {
    for (const song of this.songs) {
      yield song;
    }
  }
};

for (const song of playlist) {
  console.log(song); // "Song A", "Song B", "Song C"
}

// ============================================================
// 9. ASYNC GENERATORS (async function*)
// ============================================================
// Combine generators with async/await for streaming async data

async function* fetchPages(url) {
  let page = 1;
  while (true) {
    const response = await fetch(`${url}?page=${page}`);
    const data = await response.json();
    if (data.length === 0) return;
    yield data;
    page++;
  }
}

// Consumed with for-await-of:
// for await (const page of fetchPages("/api/items")) {
//   processBatch(page);
// }

// ============================================================
// 10. PRACTICAL USE CASES
// ============================================================

// A) Unique ID generator
function* idGenerator(prefix = "id") {
  let id = 0;
  while (true) {
    yield `${prefix}_${id++}`;
  }
}
const ids = idGenerator("user");
// ids.next().value → "user_0", "user_1", "user_2"...

// B) Stateful iteration — round-robin scheduler
function* roundRobin(...items) {
  let i = 0;
  while (true) {
    yield items[i % items.length];
    i++;
  }
}
const servers = roundRobin("server1", "server2", "server3");
// servers.next().value cycles through forever

// C) Controlled concurrency / cooperative multitasking
// Generators were the basis of coroutines before async/await existed.
// Libraries like co() and redux-saga use generators for managing async flows.

// ============================================================
// INTERVIEW QUICK HITS
// ============================================================
// Q: Difference between an iterator and an iterable?
//    - Iterator: object with .next() → {value, done}
//    - Iterable: object with [Symbol.iterator]() → returns an iterator
//    - A generator function returns an object that is BOTH
//
// Q: When is a generator "done"?
//    - When it executes `return` (or falls off the end of the function)
//    - The return value goes into {value: X, done: true}
//    - for...of does NOT see the return value (it stops at done: true)
//
// Q: Are generators re-usable?
//    - No. Once exhausted (done: true), calling .next() always returns {value: undefined, done: true}
//    - You must call the generator FUNCTION again to get a new iterator
//
// Q: Generator vs. Array?
//    - Generators are lazy (O(1) memory for infinite sequences)
//    - Arrays are eager (all values computed and stored upfront)
//    - Use generators when the sequence is large/infinite or when you might stop early
//
// Q: What happens if you use `return` inside a generator?
//    - It immediately finishes the generator (done: true)
//    - The returned value is the final {value}, but for...of won't see it
