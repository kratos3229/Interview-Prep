# SDE-1 Interview Prep — Complete Reference

> Quick-scan guide covering JS fundamentals, React, machine coding, data structures, and DSA patterns. Code files in this repo are linked throughout.

---

## Table of Contents

1. [JavaScript Core Concepts](#1-javascript-core-concepts)
2. [React Concepts](#2-react-concepts)
3. [Machine Coding — Vanilla JS](#3-machine-coding--vanilla-js)
4. [Machine Coding — React](#4-machine-coding--react)
5. [Data Structures](#5-data-structures)
6. [Common DSA Patterns](#6-common-dsa-patterns)
7. [Common Interview Questions](#7-common-interview-questions)

---

## 1. JavaScript Core Concepts

---

### `var` vs `let` vs `const`

| | `var` | `let` | `const` |
|---|---|---|---|
| Scope | Function | Block | Block |
| Hoisted | Yes (as `undefined`) | Yes (TDZ) | Yes (TDZ) |
| Re-assignable | Yes | Yes | No |
| Re-declarable | Yes | No | No |

**Temporal Dead Zone (TDZ):** The period between the start of a block and the `let`/`const` declaration. Accessing the variable in this window throws a `ReferenceError`.

```js
console.log(x); // undefined (var hoisted)
console.log(y); // ReferenceError (TDZ)
var x = 1;
let y = 2;
```

> **Gotcha:** `const` prevents re-assignment, not mutation. `const obj = {}; obj.a = 1` is fine.

---

### Data Types & Type Coercion

**Primitives** (immutable, stored by value): `string`, `number`, `bigint`, `boolean`, `undefined`, `null`, `symbol`

**Reference types** (stored by reference): `object`, `array`, `function`

```js
typeof null        // "object" — famous JS bug
typeof undefined   // "undefined"
typeof []          // "object"
typeof function(){} // "function"

// instanceof checks the prototype chain
[] instanceof Array  // true
[] instanceof Object // true
```

**Type coercion traps:**
```js
0 == false        // true  (loose equality coerces)
0 === false       // false (strict equality — always prefer this)
null == undefined // true
null === undefined// false
[] + []           // ""
[] + {}           // "[object Object]"
{} + []           // 0 (in statement context, {} is a block)
```

---

### Hoisting

JavaScript moves **declarations** (not initializations) to the top of their scope before execution.

```js
// Function declarations are fully hoisted
greet(); // works
function greet() { console.log("hi"); }

// var hoisted as undefined
console.log(a); // undefined
var a = 5;

// let/const are hoisted but stay in TDZ
console.log(b); // ReferenceError
let b = 5;

// Function expressions are NOT hoisted
foo(); // TypeError: foo is not a function
var foo = function() {};
```

---

### Scope

- **Global scope** — accessible everywhere
- **Function scope** — `var` lives here
- **Block scope** — `let`/`const` live here (`{}`, `if`, `for`)
- **Lexical scope** — a function's scope is determined by where it's **defined**, not where it's called

```js
const outer = "outer";
function parent() {
  const inner = "inner";
  function child() {
    console.log(outer); // "outer" — lexical scope chains up
    console.log(inner); // "inner"
  }
  child();
}
```

---

### Closures

A closure is a function that **remembers** the variables from its outer scope even after that outer function has returned.

> See [`./closures.js`](./closures.js) for full examples.

```js
function makeCounter() {
  let count = 0;
  return {
    increment: () => ++count,
    decrement: () => --count,
    value: () => count
  };
}

const counter = makeCounter();
counter.increment(); // 1
counter.increment(); // 2
counter.value();     // 2
// count is not accessible from outside — private via closure
```

**Common use cases:** data privacy, factory functions, memoization, event handlers.

> **Gotcha:** Classic loop bug with `var`:
```js
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}
// Prints 3, 3, 3 — all callbacks share the same `i`
// Fix: use let (block scope) or IIFE
```

---

### Prototype Chain & Prototypal Inheritance

Every JS object has an internal `[[Prototype]]` link. When you access a property, JS walks up this chain until it finds it or reaches `null`.

```js
function Animal(name) {
  this.name = name;
}
Animal.prototype.speak = function() {
  return `${this.name} makes a sound`;
};

function Dog(name) {
  Animal.call(this, name); // inherit properties
}
Dog.prototype = Object.create(Animal.prototype); // inherit methods
Dog.prototype.constructor = Dog;

Dog.prototype.bark = function() { return "Woof!"; };

const d = new Dog("Rex");
d.bark();  // "Woof!"
d.speak(); // "Rex makes a sound" — found up the chain
```

**ES6 class syntax** is syntactic sugar over this same prototype mechanism.

```js
class Animal {
  constructor(name) { this.name = name; }
  speak() { return `${this.name} makes a sound`; }
}
class Dog extends Animal {
  bark() { return "Woof!"; }
}
```

---

### `this` Keyword — 4 Rules

| Rule | Context | `this` value |
|---|---|---|
| Default | Standalone function call (non-strict) | `window` / `undefined` in strict |
| Implicit | Method call: `obj.fn()` | `obj` |
| Explicit | `fn.call(ctx)` / `fn.apply(ctx)` / `fn.bind(ctx)` | `ctx` |
| new | `new Fn()` | newly created object |

Arrow functions **do not have their own `this`** — they inherit `this` from the enclosing lexical scope.

```js
const obj = {
  name: "Alice",
  greet: function() {
    console.log(this.name); // "Alice" — implicit binding
  },
  greetArrow: () => {
    console.log(this.name); // undefined — arrow has no own `this`
  }
};
```

> **Gotcha:** Passing a method as a callback loses `this`:
```js
const greet = obj.greet;
greet(); // undefined — lost binding, use .bind(obj) to fix
```

---

### `call`, `apply`, `bind`

All three let you explicitly set `this`.

```js
function introduce(greeting, punctuation) {
  return `${greeting}, I'm ${this.name}${punctuation}`;
}

const person = { name: "Bob" };

introduce.call(person, "Hi", "!");    // "Hi, I'm Bob!" — args as list
introduce.apply(person, ["Hi", "!"]); // "Hi, I'm Bob!" — args as array
const fn = introduce.bind(person);    // returns new function, does not call
fn("Hey", ".");                       // "Hey, I'm Bob."
```

**Practical use:** borrowing array methods for array-like objects:
```js
const args = { 0: "a", 1: "b", length: 2 };
Array.prototype.slice.call(args); // ["a", "b"]
```

---

### Event Loop

JS is single-threaded. The event loop coordinates async work.

```
Call Stack → (sync code runs here)
Web APIs   → (setTimeout, fetch, DOM events)
Task Queue → (macrotasks: setTimeout callbacks, setInterval)
Microtask Queue → (Promises .then, MutationObserver, queueMicrotask)
```

**Order of execution:** current sync code → all microtasks → one macrotask → all microtasks → one macrotask → ...

```js
console.log("1");

setTimeout(() => console.log("2"), 0); // macrotask

Promise.resolve().then(() => console.log("3")); // microtask

console.log("4");

// Output: 1, 4, 3, 2
```

> **Key insight:** Microtasks (Promises) always run before the next macrotask (setTimeout), even with `setTimeout(..., 0)`.

---

### Promises & Async/Await

> See [`./promise.js`](./promise.js) for full examples and combinator comparison table.

```js
// Promise chain
fetch("/api/user")
  .then(res => res.json())
  .then(user => console.log(user))
  .catch(err => console.error(err))
  .finally(() => setLoading(false));

// Async/await — same thing, cleaner syntax
async function getUser() {
  try {
    const res = await fetch("/api/user");
    const user = await res.json();
    return user;
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
}
```

**Combinators quick ref:**

| Method | Resolves when | Rejects when |
|---|---|---|
| `Promise.all` | ALL resolve | ANY rejects |
| `Promise.allSettled` | ALL settle (never rejects) | — |
| `Promise.race` | FIRST settles | FIRST rejects |
| `Promise.any` | FIRST resolves | ALL reject |

---

### Event Delegation & Bubbling

**Bubbling:** events propagate from target → ancestors up to `document`.

**Delegation:** attach ONE listener to a parent, handle events from all children. Efficient for dynamic lists.

```js
document.getElementById("list").addEventListener("click", (e) => {
  const item = e.target.closest("li");
  if (!item) return;
  console.log("Clicked:", item.textContent);
});
// Works even for <li> elements added after the listener is set up
```

- `e.stopPropagation()` — stops bubbling
- `e.preventDefault()` — prevents default browser behavior
- Third arg `true` to `addEventListener` — listen in capture phase (top-down)

---

### Debounce, Throttle, Memoization

> Full implementations in [`./JS-Machine-Coding.md`](./JS-Machine-Coding.md) and [`./tempFileToTakeNotes.js`](./tempFileToTakeNotes.js).

**Debounce** — delay execution until after a pause in calls. Use for search inputs.
**Throttle** — limit execution to once per interval. Use for scroll/resize handlers.
**Memoize** — cache results of expensive pure functions by input.

---

### Deep Clone

```js
// Simple (loses Date, RegExp, functions, circular refs)
const clone = JSON.parse(JSON.stringify(obj));

// Modern — handles most cases
const clone = structuredClone(obj);

// Lodash
const clone = _.cloneDeep(obj);
```

> See [`./JS-Machine-Coding.md`](./JS-Machine-Coding.md) for manual recursive implementation handling edge cases.

---

### Currying & Partial Application

**Currying** transforms `f(a, b, c)` into `f(a)(b)(c)` — converts multi-arg function into chain of single-arg functions.

```js
const curry = (fn) => {
  const arity = fn.length;
  return function curried(...args) {
    if (args.length >= arity) return fn(...args);
    return (...moreArgs) => curried(...args, ...moreArgs);
  };
};

const add = curry((a, b, c) => a + b + c);
add(1)(2)(3);  // 6
add(1, 2)(3);  // 6
add(1)(2, 3);  // 6
```

**Partial application** pre-fills some arguments:
```js
const multiply = (a, b) => a * b;
const double = multiply.bind(null, 2);
double(5); // 10
```

---

### Generators & Iterators

**Iterator protocol:** an object with a `next()` method returning `{ value, done }`.

**Generator function** (`function*`) produces an iterator. Execution pauses at each `yield`.

```js
function* range(start, end) {
  for (let i = start; i <= end; i++) {
    yield i;
  }
}

const gen = range(1, 3);
gen.next(); // { value: 1, done: false }
gen.next(); // { value: 2, done: false }
gen.next(); // { value: 3, done: false }
gen.next(); // { value: undefined, done: true }

// Iterable — works with for...of, spread, destructuring
[...range(1, 5)]; // [1, 2, 3, 4, 5]
```

**Use case:** lazy sequences, infinite streams, async iteration.

---

### ES6+ Features Cheatsheet

```js
// Destructuring
const { a, b: renamed, c = "default" } = obj;
const [first, , third] = arr;
const { a: { nested } } = deep;

// Spread / Rest
const merged = { ...obj1, ...obj2 };      // object spread (later overwrites)
const copy = [...arr1, ...arr2];           // array spread
function fn(first, ...rest) {}             // rest params

// Optional chaining
user?.address?.city     // undefined instead of TypeError
arr?.[0]                // safe index access
fn?.()                  // safe call

// Nullish coalescing — only null/undefined (not 0, "" falsy)
const name = user.name ?? "Anonymous";

// Logical assignment
x ??= defaultVal;  // x = x ?? defaultVal
x ||= fallback;    // x = x || fallback
x &&= transform(x);// x = x && transform(x)

// Tagged template literals
const highlight = (strings, ...values) =>
  strings.reduce((acc, str, i) => acc + str + (values[i] ? `<b>${values[i]}</b>` : ""), "");
highlight`Hello ${name}, you are ${age} years old`;
```

---

### Modules: ESM vs CJS

| | ESM (`import`/`export`) | CJS (`require`/`module.exports`) |
|---|---|---|
| Environment | Browser + Node (`.mjs` or `"type":"module"`) | Node default |
| Loading | Static (analyzed at parse time) | Dynamic (runtime) |
| Tree-shaking | Yes | No |
| `this` at top level | `undefined` | `module.exports` |
| Async | Yes (top-level `await`) | No |

```js
// ESM
export const PI = 3.14;
export default function main() {}
import main, { PI } from "./math.js";

// CJS
module.exports = { PI: 3.14 };
const { PI } = require("./math");
```

---

### Error Handling

```js
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
  }
}

try {
  throw new AppError("Not found", 404);
} catch (err) {
  if (err instanceof AppError) {
    console.log(err.statusCode); // 404
  }
} finally {
  // always runs
}

// Async error handling
async function fetchData() {
  const res = await fetch(url).catch(err => { throw new AppError(err.message, 500); });
  if (!res.ok) throw new AppError("Request failed", res.status);
  return res.json();
}
```

---

### WeakMap / WeakSet / WeakRef

- **WeakMap** — keys must be objects; entries are garbage-collected when the key has no other references. No iteration.
- **WeakSet** — same but for values; only holds objects.
- **WeakRef** — holds a weak reference to an object; check `.deref()` to see if it's still alive.

**Use case:** storing private data tied to DOM nodes without preventing GC.

```js
const cache = new WeakMap();

function process(node) {
  if (cache.has(node)) return cache.get(node);
  const result = expensiveOp(node);
  cache.set(node, result);
  return result;
}
// When node is removed from DOM, cache entry is automatically GC'd
```

---

## 2. React Concepts

---

### Virtual DOM & Reconciliation

React maintains a lightweight in-memory copy of the DOM (Virtual DOM). On state change:

1. Renders a new Virtual DOM tree
2. **Diffs** it against the previous tree (reconciliation)
3. Computes the minimal set of real DOM mutations (patch)
4. Applies patches in a single batch

**Diffing rules:**
- Elements of different types → unmount old, mount new
- Same type → update attributes only
- Lists → use `key` prop to identify which items moved/added/removed

---

### JSX

JSX is syntactic sugar. `<Component prop="val" />` compiles to `React.createElement(Component, { prop: "val" })`.

```jsx
// JSX
const el = <h1 className="title">Hello</h1>;

// Compiled
const el = React.createElement("h1", { className: "title" }, "Hello");
```

> **Gotcha:** `class` → `className`, `for` → `htmlFor`, `onclick` → `onClick`.

---

### Props vs State

| | Props | State |
|---|---|---|
| Owned by | Parent | Component itself |
| Mutable by | Parent only | Component via setter |
| Triggers re-render | Yes (when parent re-renders) | Yes (when setter called) |

```jsx
function Child({ name }) {  // props — read-only
  return <span>{name}</span>;
}

function Parent() {
  const [count, setCount] = useState(0);  // state — owned here
  return <Child name={`Count: ${count}`} />;
}
```

---

### Hooks

#### `useState`

```jsx
const [value, setValue] = useState(initialValue);

// Functional update — use when new state depends on old state
setCount(prev => prev + 1);

// Object state — must spread to preserve other fields
setUser(prev => ({ ...prev, name: "Alice" }));
```

> **React 18:** state updates inside event handlers are automatically batched. Use `flushSync` to opt out.

#### `useEffect`

```jsx
useEffect(() => {
  // runs after render
  const id = setInterval(tick, 1000);

  return () => clearInterval(id); // cleanup runs before next effect or unmount
}, [dependency]); // re-runs when dependency changes

// [], run once on mount
// [dep], run on mount + when dep changes
// no array, run after every render
```

> **Gotcha:** every reactive value used inside `useEffect` must be in the dependency array, or you'll get stale closures.

#### `useRef`

```jsx
// DOM ref
const inputRef = useRef(null);
<input ref={inputRef} />
inputRef.current.focus(); // imperative access

// Mutable value — changing .current does NOT trigger re-render
const prevCount = useRef(0);
useEffect(() => { prevCount.current = count; });
```

#### `useMemo`

```jsx
const sorted = useMemo(() => heavySort(list), [list]);
// Recalculates only when `list` changes
// Don't over-use — memoization has overhead. Use for genuinely expensive computations.
```

#### `useCallback`

```jsx
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);
// Returns stable function reference — important when passing callbacks to memoized children
```

> **When to use `useCallback`:** only when the callback is a dependency of another hook, or passed to a `React.memo` child that would otherwise needlessly re-render.

#### `useContext`

```jsx
const ThemeContext = createContext("light");

// Provider
<ThemeContext.Provider value="dark">
  <App />
</ThemeContext.Provider>

// Consumer
function Button() {
  const theme = useContext(ThemeContext);
  return <button className={theme}>Click</button>;
}
```

> **Gotcha:** Every consumer re-renders when context value changes, even if it only uses part of it. Split contexts or memoize.

#### `useReducer`

```jsx
function reducer(state, action) {
  switch (action.type) {
    case "increment": return { count: state.count + 1 };
    case "reset":     return { count: 0 };
    default:          throw new Error("Unknown action");
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, { count: 0 });
  return (
    <>
      <span>{state.count}</span>
      <button onClick={() => dispatch({ type: "increment" })}>+</button>
      <button onClick={() => dispatch({ type: "reset" })}>Reset</button>
    </>
  );
}
```

Use `useReducer` over `useState` when: state has multiple sub-values, next state depends on previous in complex ways, or state logic would benefit from being extracted.

#### `useLayoutEffect`

Same signature as `useEffect` but fires **synchronously after DOM mutations, before the browser paints**. Use for reading layout (scrollHeight, getBoundingClientRect) and synchronously updating to avoid flicker.

```jsx
useLayoutEffect(() => {
  const { height } = ref.current.getBoundingClientRect();
  setHeight(height); // applied before paint — no flicker
}, []);
```

#### `useTransition` & `useDeferredValue` (React 18)

```jsx
// Mark state update as non-urgent — UI stays responsive
const [isPending, startTransition] = useTransition();
startTransition(() => setQuery(input)); // won't block user input

// Defer a value — React uses old value while computing new one
const deferredList = useDeferredValue(expensiveList);
```

---

### Custom Hooks

Rules: must start with `use`, can call other hooks, cannot be called conditionally.

```jsx
function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(url)
      .then(r => r.json())
      .then(d => { if (!cancelled) setData(d); })
      .catch(e => { if (!cancelled) setError(e); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; }; // cleanup prevents state update on unmount
  }, [url]);

  return { data, loading, error };
}
```

---

### Component Lifecycle → Hook Equivalents

| Class lifecycle | Hook equivalent |
|---|---|
| `constructor` | `useState` / `useReducer` initial value |
| `componentDidMount` | `useEffect(() => { ... }, [])` |
| `componentDidUpdate` | `useEffect(() => { ... }, [deps])` |
| `componentWillUnmount` | `useEffect` cleanup `return () => {}` |
| `shouldComponentUpdate` | `React.memo` / `useMemo` |
| `getDerivedStateFromProps` | Derive during render |

---

### Controlled vs Uncontrolled Components

**Controlled:** React state is the single source of truth. Input value driven by state.
```jsx
const [val, setVal] = useState("");
<input value={val} onChange={e => setVal(e.target.value)} />
```

**Uncontrolled:** DOM is the source of truth. Access value via ref.
```jsx
const ref = useRef();
<input ref={ref} defaultValue="initial" />
ref.current.value; // read on submit
```

---

### React.memo & When Re-renders Happen

A component re-renders when:
1. Its own state changes
2. Its parent re-renders (even if props didn't change)
3. Its context value changes

`React.memo` wraps a component and skips re-render if props haven't changed (shallow comparison).

```jsx
const Child = React.memo(function Child({ name }) {
  return <div>{name}</div>;
});
// Only re-renders when `name` prop actually changes
```

> `React.memo` is useless if the parent passes a new object/function reference every render — combine with `useMemo`/`useCallback`.

---

### Error Boundaries

Class components that catch JS errors in their child tree. No hook equivalent yet.

```jsx
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    logErrorToService(error, info.componentStack);
  }

  render() {
    if (this.state.hasError) return <h1>Something went wrong.</h1>;
    return this.props.children;
  }
}

<ErrorBoundary>
  <MyComponent />
</ErrorBoundary>
```

---

### Portals

Render children into a DOM node outside the parent component's DOM tree. Great for modals, tooltips, dropdowns.

```jsx
// In index.html: <div id="portal"></div>
import { createPortal } from "react-dom";

function Modal({ children }) {
  return createPortal(
    <div className="modal">{children}</div>,
    document.getElementById("portal")
  );
}
```

> See [`./React components/src/Modal.jsx`](./React%20components/src/Modal.jsx) for full implementation.

---

### Refs & `forwardRef`

`forwardRef` lets a parent component pass a ref down to a DOM node inside the child.

```jsx
const Input = React.forwardRef((props, ref) => (
  <input {...props} ref={ref} />
));

function Form() {
  const inputRef = useRef();
  return (
    <>
      <Input ref={inputRef} />
      <button onClick={() => inputRef.current.focus()}>Focus</button>
    </>
  );
}
```

---

### Suspense & Lazy Loading

```jsx
const HeavyChart = React.lazy(() => import("./HeavyChart"));

function Dashboard() {
  return (
    <Suspense fallback={<Spinner />}>
      <HeavyChart />
    </Suspense>
  );
}
```

---

### Key Prop — Why It Matters

`key` helps React identify which list items have changed, been added, or removed.

- Use stable, unique IDs — not array index (index causes bugs on reorder/delete)
- Key must be unique among siblings, not globally

```jsx
// Bad
items.map((item, i) => <Item key={i} {...item} />);
// Good
items.map(item => <Item key={item.id} {...item} />);
```

---

### Performance Optimization Checklist

- [ ] `React.memo` for expensive pure components
- [ ] `useMemo` for expensive derived values
- [ ] `useCallback` for stable callback references
- [ ] Lazy load routes/heavy components with `React.lazy` + `Suspense`
- [ ] `useTransition` / `useDeferredValue` for non-urgent updates
- [ ] Avoid creating objects/arrays inline in JSX (new reference every render)
- [ ] Split Context — separate frequently-changing values from stable ones
- [ ] Virtualize long lists (react-window / react-virtual)
- [ ] Code-split at route level

---

## 3. Machine Coding — Vanilla JS

---

### Already Implemented in This Repo

| Problem | Location | Key Concepts |
|---|---|---|
| Autocomplete / Typeahead | [`./Autocomplete_Typeahead/`](./Autocomplete_Typeahead/) | Debounce, keyboard nav, event delegation |
| Infinite Scroll | [`./Infinite scroll/`](./Infinite%20scroll/) | IntersectionObserver, dynamic observer reassignment |
| Tabs | [`./Tabs/`](./Tabs/) | Event delegation, `.closest()`, active state |
| Drag & Drop Sorting | [`./Drag and Drop with Sorting/`](./Drag%20and%20Drop%20with%20Sorting/) | Drag API, insertion point math |
| Modal | [`./Modal/`](./Modal/) | Overlay toggle, click-outside detection |

---

### Accordion

**What to build:** Expandable/collapsible panels. Clicking a header toggles its body; optionally collapse others.

**Key concepts:** event delegation, toggle class, DOM traversal.

```
Approach:
1. Attach one click listener to the accordion container
2. e.target.closest(".accordion-header") to find the clicked header
3. Toggle "active" class on the header's parent (.accordion-item)
4. To make it exclusive: querySelectorAll all items, remove "active" from others before toggling current
5. Height animation: set max-height: 0 → max-height: <content height> with CSS transition
```

---

### Star Rating

**What to build:** 5-star clickable rating widget with hover preview.

**Key concepts:** mouseover/mouseout, data attributes, CSS state.

```
Approach:
1. Render 5 span/button elements with data-value="1" to "5"
2. On mouseover: highlight all stars up to hovered index
3. On mouseout: reset to selected rating
4. On click: set selected rating, persist visually
5. Stars filled/empty via CSS class or Unicode (★ ☆)
```

---

### Carousel / Image Slider

**What to build:** Auto-advancing or manual image slider with prev/next buttons and dot indicators.

**Key concepts:** CSS `transform: translateX`, index management, `setInterval`.

```
Approach:
1. All slides in a flex row inside an overflow:hidden container
2. Track currentIndex; on next: currentIndex = (currentIndex + 1) % slides.length
3. Apply transform: translateX(-currentIndex * 100%) to slide track
4. Auto-play: setInterval to advance; pause on hover (clearInterval)
5. Dots: re-render active dot class based on currentIndex
```

---

### Form Validation

**Key patterns:**

```js
const patterns = {
  email:    /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone:    /^\+?[\d\s\-()]{7,15}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/,
  url:      /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b/
};

function validate(value, rule) {
  return patterns[rule]?.test(value) ?? true;
}

// Real-time: validate on input event (debounced) and show inline error
// On submit: validate all fields, prevent submit if any fail
```

---

### Virtual / Windowed List

**What to build:** Render only visible rows of a large list (10k+ items) without crashing the browser.

**Key concepts:** scroll position math, absolute positioning, buffer rows.

```
Approach:
1. Outer container: fixed height, overflow-y: scroll
2. Inner "spacer" div: height = totalItems * rowHeight (creates real scrollbar)
3. On scroll: startIndex = Math.floor(scrollTop / rowHeight)
4. Render only visibleCount + buffer items, absolutely positioned at startIndex * rowHeight
5. Update on scroll event (throttled)
```

---

### Tic Tac Toe

```
State: board[9], currentPlayer, winner
Render: 3x3 grid of buttons
On click: if square empty and no winner, set board[i] = currentPlayer, check winner, toggle player
Check winner: define 8 winning lines, check if any line has all same non-null values
```

---

### Todo List with CRUD

```
State: todos = [{ id, text, completed }]
Operations:
  Add: push new todo, clear input
  Delete: filter by id
  Toggle: map, flip completed for matching id
  Edit: map, update text for matching id
Persistence: JSON.stringify to localStorage, parse on load
```

---

### Debounced Search with LRU Cache

> Full implementation in [`./JS-Machine-Coding.md`](./JS-Machine-Coding.md).

```
Approach:
1. Debounce input handler (300ms)
2. On trigger: check LRU cache (Map — insertion-order iteration)
3. Cache hit: render immediately
4. Cache miss: fetch, store in cache, evict oldest if over capacity
LRU eviction: cache.delete(cache.keys().next().value) — deletes oldest Map entry
```

---

## 4. Machine Coding — React

---

### Modal with Portal

> See [`./React components/src/Modal.jsx`](./React%20components/src/Modal.jsx).

Key pattern: `ReactDOM.createPortal`, trap focus inside modal, close on Escape key, prevent body scroll.

---

### `useFetch` Custom Hook

```jsx
function useFetch(url) {
  const [state, dispatch] = useReducer(
    (s, a) => ({ ...s, ...a }),
    { data: null, loading: true, error: null }
  );

  useEffect(() => {
    let cancelled = false;
    dispatch({ loading: true, error: null });
    fetch(url)
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(data => { if (!cancelled) dispatch({ data, loading: false }); })
      .catch(error => { if (!cancelled) dispatch({ error, loading: false }); });
    return () => { cancelled = true; };
  }, [url]);

  return state;
}
```

---

### `useForm` Custom Hook

```jsx
function useForm(initialValues, validate) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({ ...prev, ...validate({ [name]: values[name] }) }));
  };

  const handleSubmit = (onSubmit) => (e) => {
    e.preventDefault();
    const allErrors = validate(values);
    setErrors(allErrors);
    setTouched(Object.fromEntries(Object.keys(values).map(k => [k, true])));
    if (Object.keys(allErrors).length === 0) onSubmit(values);
  };

  return { values, errors, touched, handleChange, handleBlur, handleSubmit };
}
```

---

### Infinite Scroll with Custom Hook

```jsx
function useIntersectionObserver(callback, options) {
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) callback();
    }, options);
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [callback]);
  return ref;
}

function Feed() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);

  const loadMore = useCallback(() => setPage(p => p + 1), []);
  const sentinelRef = useIntersectionObserver(loadMore);

  useEffect(() => {
    fetchPage(page).then(newItems => setItems(prev => [...prev, ...newItems]));
  }, [page]);

  return (
    <>
      {items.map(item => <Card key={item.id} {...item} />)}
      <div ref={sentinelRef} style={{ height: 1 }} />
    </>
  );
}
```

---

### Multi-step Form / Wizard

```jsx
const STEPS = ["Personal", "Address", "Review"];

function Wizard() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({});

  const next = (data) => {
    setFormData(prev => ({ ...prev, ...data }));
    setStep(s => s + 1);
  };

  const back = () => setStep(s => s - 1);

  return (
    <div>
      <StepIndicator steps={STEPS} current={step} />
      {step === 0 && <PersonalStep onNext={next} />}
      {step === 1 && <AddressStep onNext={next} onBack={back} />}
      {step === 2 && <ReviewStep data={formData} onBack={back} onSubmit={submit} />}
    </div>
  );
}
```

---

## 5. Data Structures

---

### Array

**Time complexity:** Access O(1), Search O(n), Insert/Delete at end O(1) amortized, Insert/Delete at middle O(n).

```js
// Common patterns
arr.push(x);            // add to end
arr.pop();              // remove from end
arr.unshift(x);         // add to front — O(n)
arr.shift();            // remove from front — O(n)
arr.splice(i, 1);       // delete at index i — O(n)
arr.slice(start, end);  // copy subarray (non-mutating)
arr.indexOf(x);         // linear search, -1 if not found
arr.includes(x);        // same, returns boolean

// Higher-order
arr.map(fn);            // transform, returns new array
arr.filter(fn);         // keep elements where fn returns true
arr.reduce((acc, x) => ..., init); // fold to single value
arr.find(fn);           // first element where fn is true
arr.findIndex(fn);      // index of that element
arr.some(fn);           // true if any element passes
arr.every(fn);          // true if all elements pass
arr.flat(depth);        // flatten nested arrays
arr.flatMap(fn);        // map then flatten one level
```

---

### String

Strings are **immutable** in JS — methods return new strings.

```js
str.split(",");         // string → array
arr.join("-");          // array → string
str.trim();             // remove leading/trailing whitespace
str.replace(re, sub);   // replace (use /g flag for all)
str.includes(substr);   // boolean
str.startsWith(s);
str.endsWith(s);
str.slice(start, end);  // substring (negative indices OK)
str.padStart(n, "0");   // pad to length
str.repeat(n);
str.charCodeAt(i);      // char → ASCII code
String.fromCharCode(n); // ASCII → char

// Reverse a string
str.split("").reverse().join("");
```

---

### Linked List

**Singly linked list:** each node points to `next`. O(1) insert/delete at head, O(n) search.

```js
class ListNode {
  constructor(val) {
    this.val = val;
    this.next = null;
  }
}

class LinkedList {
  constructor() { this.head = null; }

  prepend(val) {
    const node = new ListNode(val);
    node.next = this.head;
    this.head = node;
  }

  delete(val) {
    if (!this.head) return;
    if (this.head.val === val) { this.head = this.head.next; return; }
    let curr = this.head;
    while (curr.next) {
      if (curr.next.val === val) { curr.next = curr.next.next; return; }
      curr = curr.next;
    }
  }

  toArray() {
    const result = [];
    let curr = this.head;
    while (curr) { result.push(curr.val); curr = curr.next; }
    return result;
  }
}
```

---

### Stack

LIFO. Use JS array with `push`/`pop`.

```js
const stack = [];
stack.push(1);   // [1]
stack.push(2);   // [1, 2]
stack.pop();     // returns 2, stack = [1]
stack.at(-1);    // peek — returns 1 without removing

// Use cases: undo/redo, browser history, balanced parentheses, DFS
```

**Balanced parentheses:**
```js
function isBalanced(s) {
  const stack = [];
  const map = { ")": "(", "]": "[", "}": "{" };
  for (const c of s) {
    if ("([{".includes(c)) stack.push(c);
    else if (stack.pop() !== map[c]) return false;
  }
  return stack.length === 0;
}
```

---

### Queue

FIFO. For O(1) both ends, use a deque or linked list. JS arrays are fine for interview purposes.

```js
const queue = [];
queue.push("a");    // enqueue
queue.shift();      // dequeue — O(n) for arrays but fine in interviews

// Use cases: BFS, task scheduling, rate limiting, sliding window
```

---

### Hash Map

O(1) average for get/set/delete. Handles collisions via chaining or open addressing.

```js
// JS Map — preserves insertion order, any key type
const map = new Map();
map.set("key", "value");
map.get("key");    // "value"
map.has("key");    // true
map.delete("key");
map.size;
for (const [k, v] of map) {}

// Plain object — string/symbol keys only
const obj = {};
obj["key"] = "value";
Object.keys(obj);
Object.entries(obj);

// Frequency counter pattern
function freq(arr) {
  return arr.reduce((map, x) => map.set(x, (map.get(x) ?? 0) + 1), new Map());
}
```

---

### Set

Unique values, O(1) lookup.

```js
const set = new Set([1, 2, 2, 3]); // {1, 2, 3}
set.add(4);
set.has(2);    // true
set.delete(2);
set.size;

// Remove duplicates from array
[...new Set(arr)];

// Intersection
const intersection = new Set([...a].filter(x => b.has(x)));

// Union
const union = new Set([...a, ...b]);
```

---

### Binary Tree

```js
class TreeNode {
  constructor(val) {
    this.val = val;
    this.left = null;
    this.right = null;
  }
}

// Traversals
function inorder(node, result = []) {     // left → root → right (sorted for BST)
  if (!node) return result;
  inorder(node.left, result);
  result.push(node.val);
  inorder(node.right, result);
  return result;
}

function preorder(node, result = []) {    // root → left → right
  if (!node) return result;
  result.push(node.val);
  preorder(node.left, result);
  preorder(node.right, result);
  return result;
}

function postorder(node, result = []) {   // left → right → root
  if (!node) return result;
  postorder(node.left, result);
  postorder(node.right, result);
  result.push(node.val);
  return result;
}

// Height
function height(node) {
  if (!node) return 0;
  return 1 + Math.max(height(node.left), height(node.right));
}
```

---

### Binary Search Tree (BST)

- Left subtree: all values < node
- Right subtree: all values > node
- Inorder traversal gives sorted order

```js
function bstInsert(root, val) {
  if (!root) return new TreeNode(val);
  if (val < root.val) root.left = bstInsert(root.left, val);
  else if (val > root.val) root.right = bstInsert(root.right, val);
  return root;
}

function bstSearch(root, val) {
  if (!root || root.val === val) return root;
  return val < root.val ? bstSearch(root.left, val) : bstSearch(root.right, val);
}
```

---

### Heap (Priority Queue)

Min-heap: parent ≤ children. Extract-min is O(log n), insert is O(log n), peek-min is O(1).

JS has no built-in heap — implement with array or use `@datastructures-js/priority-queue` in LeetCode.

```js
// Min-heap key operations (index math: parent=(i-1)>>1, left=2i+1, right=2i+2)
class MinHeap {
  constructor() { this.heap = []; }

  push(val) {
    this.heap.push(val);
    this._bubbleUp(this.heap.length - 1);
  }

  pop() {
    const top = this.heap[0];
    const last = this.heap.pop();
    if (this.heap.length) { this.heap[0] = last; this._sinkDown(0); }
    return top;
  }

  peek() { return this.heap[0]; }
  size() { return this.heap.length; }

  _bubbleUp(i) {
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.heap[p] <= this.heap[i]) break;
      [this.heap[p], this.heap[i]] = [this.heap[i], this.heap[p]];
      i = p;
    }
  }

  _sinkDown(i) {
    const n = this.heap.length;
    while (true) {
      let smallest = i;
      const l = 2 * i + 1, r = 2 * i + 2;
      if (l < n && this.heap[l] < this.heap[smallest]) smallest = l;
      if (r < n && this.heap[r] < this.heap[smallest]) smallest = r;
      if (smallest === i) break;
      [this.heap[smallest], this.heap[i]] = [this.heap[i], this.heap[smallest]];
      i = smallest;
    }
  }
}
```

---

### Graph

Represented as an adjacency list.

```js
// Build adjacency list
function buildGraph(edges) {
  const graph = new Map();
  for (const [a, b] of edges) {
    if (!graph.has(a)) graph.set(a, []);
    if (!graph.has(b)) graph.set(b, []);
    graph.get(a).push(b);
    graph.get(b).push(a); // omit for directed graph
  }
  return graph;
}
```

---

### Trie

Prefix tree for string problems (autocomplete, word search).

```js
class TrieNode {
  constructor() {
    this.children = {};
    this.isEnd = false;
  }
}

class Trie {
  constructor() { this.root = new TrieNode(); }

  insert(word) {
    let node = this.root;
    for (const ch of word) {
      if (!node.children[ch]) node.children[ch] = new TrieNode();
      node = node.children[ch];
    }
    node.isEnd = true;
  }

  search(word) {
    let node = this.root;
    for (const ch of word) {
      if (!node.children[ch]) return false;
      node = node.children[ch];
    }
    return node.isEnd;
  }

  startsWith(prefix) {
    let node = this.root;
    for (const ch of prefix) {
      if (!node.children[ch]) return false;
      node = node.children[ch];
    }
    return true;
  }
}
```

---

## 6. Common DSA Patterns

---

### Two Pointers

**When to use:** sorted array problems, palindromes, pair sums, removing duplicates in-place.

**Trigger words:** "sorted array", "pair with sum", "in-place", "palindrome".

```js
// Template: find pair with target sum in sorted array
function twoSum(arr, target) {
  let left = 0, right = arr.length - 1;
  while (left < right) {
    const sum = arr[left] + arr[right];
    if (sum === target) return [left, right];
    else if (sum < target) left++;
    else right--;
  }
  return [];
}
```

**Examples:** Two Sum II, Container With Most Water, Valid Palindrome, Remove Duplicates from Sorted Array.

---

### Sliding Window

**When to use:** contiguous subarray/substring problems.

**Trigger words:** "subarray", "substring", "window", "consecutive", "at most K distinct".

```js
// Variable-size window: longest substring with at most K distinct chars
function longestKDistinct(s, k) {
  const count = new Map();
  let left = 0, maxLen = 0;
  for (let right = 0; right < s.length; right++) {
    count.set(s[right], (count.get(s[right]) ?? 0) + 1);
    while (count.size > k) {
      const ch = s[left++];
      count.set(ch, count.get(ch) - 1);
      if (count.get(ch) === 0) count.delete(ch);
    }
    maxLen = Math.max(maxLen, right - left + 1);
  }
  return maxLen;
}
```

**Examples:** Maximum Sum Subarray of Size K, Longest Substring Without Repeating Characters, Minimum Window Substring.

---

### Fast & Slow Pointers

**When to use:** cycle detection in linked lists, finding middle, detecting if a number is "happy".

```js
// Detect cycle in linked list
function hasCycle(head) {
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) return true;
  }
  return false;
}

// Find middle of linked list
function findMiddle(head) {
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
  }
  return slow; // slow is at middle when fast reaches end
}
```

---

### Binary Search

**When to use:** sorted input, search space can be halved each step, "find minimum/maximum that satisfies condition".

**Trigger words:** "sorted", "rotated sorted", "find target", "minimum in rotated", "search in matrix".

```js
// Template — left boundary (first occurrence / leftmost valid)
function binarySearch(arr, target) {
  let left = 0, right = arr.length - 1;
  while (left <= right) {
    const mid = left + ((right - left) >> 1); // avoids overflow
    if (arr[mid] === target) return mid;
    else if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}

// Binary search on answer — "find min X such that condition(X) is true"
function binarySearchAnswer(lo, hi, condition) {
  while (lo < hi) {
    const mid = lo + ((hi - lo) >> 1);
    if (condition(mid)) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}
```

**Examples:** Binary Search, Search in Rotated Sorted Array, Find Minimum in Rotated Sorted Array, Koko Eating Bananas.

---

### BFS (Breadth-First Search)

**When to use:** shortest path in unweighted graph, level-order traversal, spreading (number of islands).

**Trigger words:** "shortest path", "minimum steps", "level by level", "nearest".

```js
// Template — graph BFS
function bfs(graph, start) {
  const queue = [start];
  const visited = new Set([start]);
  const dist = new Map([[start, 0]]);

  while (queue.length) {
    const node = queue.shift();
    for (const neighbor of graph.get(node) ?? []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        dist.set(neighbor, dist.get(node) + 1);
        queue.push(neighbor);
      }
    }
  }
  return dist;
}

// Tree level-order traversal
function levelOrder(root) {
  if (!root) return [];
  const result = [], queue = [root];
  while (queue.length) {
    const level = [];
    for (let i = queue.length; i > 0; i--) {
      const node = queue.shift();
      level.push(node.val);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    result.push(level);
  }
  return result;
}
```

---

### DFS (Depth-First Search)

**When to use:** explore all paths, cycle detection, connected components, tree path problems.

```js
// Recursive DFS — graph
function dfs(graph, node, visited = new Set()) {
  if (visited.has(node)) return;
  visited.add(node);
  // process node
  for (const neighbor of graph.get(node) ?? []) {
    dfs(graph, neighbor, visited);
  }
}

// Iterative DFS using stack
function dfsIterative(graph, start) {
  const stack = [start];
  const visited = new Set();
  while (stack.length) {
    const node = stack.pop();
    if (visited.has(node)) continue;
    visited.add(node);
    for (const neighbor of graph.get(node) ?? []) {
      if (!visited.has(neighbor)) stack.push(neighbor);
    }
  }
}
```

**Examples:** Number of Islands, Clone Graph, Path Sum, Word Search.

---

### Backtracking

**When to use:** generate all combinations/permutations/subsets, constraint satisfaction.

**Trigger words:** "all combinations", "all permutations", "generate", "find all", "N-Queens".

```js
// Template — subsets
function subsets(nums) {
  const result = [];
  function backtrack(start, current) {
    result.push([...current]);
    for (let i = start; i < nums.length; i++) {
      current.push(nums[i]);
      backtrack(i + 1, current);
      current.pop(); // undo — the key step
    }
  }
  backtrack(0, []);
  return result;
}

// Permutations
function permutations(nums) {
  const result = [];
  function backtrack(current, remaining) {
    if (!remaining.length) { result.push([...current]); return; }
    for (let i = 0; i < remaining.length; i++) {
      current.push(remaining[i]);
      backtrack(current, [...remaining.slice(0, i), ...remaining.slice(i + 1)]);
      current.pop();
    }
  }
  backtrack([], nums);
  return result;
}
```

---

### Dynamic Programming

**When to use:** overlapping subproblems + optimal substructure. "Count ways", "max/min value", "is it possible".

**Two approaches:**
- **Top-down (memoization):** recursion + cache
- **Bottom-up (tabulation):** fill a table iteratively

```js
// Fibonacci — memo
function fib(n, memo = {}) {
  if (n in memo) return memo[n];
  if (n <= 1) return n;
  return memo[n] = fib(n - 1, memo) + fib(n - 2, memo);
}

// 0/1 Knapsack — tabulation
function knapsack(weights, values, capacity) {
  const n = weights.length;
  const dp = Array.from({ length: n + 1 }, () => Array(capacity + 1).fill(0));
  for (let i = 1; i <= n; i++) {
    for (let w = 0; w <= capacity; w++) {
      dp[i][w] = dp[i - 1][w]; // don't take item i
      if (weights[i - 1] <= w) {
        dp[i][w] = Math.max(dp[i][w], dp[i - 1][w - weights[i - 1]] + values[i - 1]);
      }
    }
  }
  return dp[n][capacity];
}

// Coin change — min coins for amount
function coinChange(coins, amount) {
  const dp = Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      if (coin <= i) dp[i] = Math.min(dp[i], dp[i - coin] + 1);
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}
```

**Common DP problems:** Climbing Stairs, House Robber, Longest Common Subsequence, Longest Increasing Subsequence, Edit Distance, Coin Change.

---

### Greedy

**When to use:** locally optimal choice leads to globally optimal solution. Often for interval problems, scheduling.

**Trigger words:** "minimum number of", "maximize", "interval", "meeting rooms".

```js
// Merge intervals
function merge(intervals) {
  intervals.sort((a, b) => a[0] - b[0]);
  const result = [intervals[0]];
  for (const [start, end] of intervals.slice(1)) {
    const last = result.at(-1);
    if (start <= last[1]) last[1] = Math.max(last[1], end);
    else result.push([start, end]);
  }
  return result;
}
```

**Examples:** Jump Game, Gas Station, Meeting Rooms, Minimum Number of Arrows.

---

### Monotonic Stack

**When to use:** "next greater element", "previous smaller element", "stock span", "largest rectangle in histogram".

Maintain a stack that is always increasing or decreasing.

```js
// Next Greater Element
function nextGreater(arr) {
  const result = Array(arr.length).fill(-1);
  const stack = []; // stores indices

  for (let i = 0; i < arr.length; i++) {
    while (stack.length && arr[stack.at(-1)] < arr[i]) {
      result[stack.pop()] = arr[i];
    }
    stack.push(i);
  }
  return result;
}

// Daily Temperatures (same pattern)
function dailyTemps(temps) {
  const result = Array(temps.length).fill(0);
  const stack = [];
  for (let i = 0; i < temps.length; i++) {
    while (stack.length && temps[stack.at(-1)] < temps[i]) {
      const j = stack.pop();
      result[j] = i - j;
    }
    stack.push(i);
  }
  return result;
}
```

---

### Prefix Sum

**When to use:** range sum queries, subarray sum problems.

```js
// Build prefix sum array
function buildPrefix(arr) {
  const prefix = [0];
  for (const x of arr) prefix.push(prefix.at(-1) + x);
  return prefix;
}
// Range sum [i, j] (0-indexed inclusive)
function rangeSum(prefix, i, j) { return prefix[j + 1] - prefix[i]; }

// Subarray sum equals k (count subarrays)
function subarraySum(nums, k) {
  let count = 0, sum = 0;
  const freq = new Map([[0, 1]]);
  for (const x of nums) {
    sum += x;
    count += freq.get(sum - k) ?? 0;
    freq.set(sum, (freq.get(sum) ?? 0) + 1);
  }
  return count;
}
```

---

### Divide and Conquer

Split problem in half, solve recursively, combine results.

```js
// Merge Sort — O(n log n)
function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  const mid = arr.length >> 1;
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  return merge(left, right);
}

function merge(left, right) {
  const result = [];
  let i = 0, j = 0;
  while (i < left.length && j < right.length) {
    result.push(left[i] <= right[j] ? left[i++] : right[j++]);
  }
  return [...result, ...left.slice(i), ...right.slice(j)];
}
```

---

## 7. Common Interview Questions

---

### JavaScript Q&A

**Q: What is the difference between `==` and `===`?**
A: `==` coerces types before comparing; `===` requires same type and value. Always use `===` to avoid unexpected coercion bugs.

**Q: What is a closure and why is it useful?**
A: A closure is a function that retains access to its outer scope's variables after the outer function has returned. Used for data privacy, factory functions, and maintaining state in callbacks.

**Q: Explain the event loop.**
A: JS runs synchronous code on the call stack. Async work (timers, fetch) is handed to Web APIs. Callbacks queue up in the macrotask queue; Promise callbacks go to the microtask queue. After each task, all microtasks run before the next macrotask.

**Q: What is hoisting?**
A: Variable and function declarations are moved to the top of their scope during the compilation phase. `var` is initialized as `undefined`; `let`/`const` are in the TDZ until their declaration line. Function declarations are fully hoisted.

**Q: What's the difference between `null` and `undefined`?**
A: `undefined` means a variable was declared but not assigned. `null` is an explicit "no value" intentionally set. `typeof null === "object"` is a historical bug.

**Q: How does `this` work in arrow functions vs regular functions?**
A: Regular functions have their own `this` determined at call time. Arrow functions have no own `this` and use the lexical `this` from where they were defined.

**Q: What is the prototype chain?**
A: Every object has a `[[Prototype]]` link. Property lookup walks up the chain until found or `null` is reached. `Object.prototype` is the top. `class` / `extends` is syntactic sugar over this.

**Q: Explain Promise.all vs Promise.allSettled.**
A: `Promise.all` short-circuits and rejects if any promise rejects. `Promise.allSettled` waits for all to settle and returns an array of `{status, value/reason}` objects — useful when you want all results even if some fail.

**Q: What is debouncing and when would you use it?**
A: Debouncing delays a function's execution until after a pause in calls. Use for search inputs, form validation, or resize handlers — anything where you want to wait until the user stops triggering the event.

**Q: What is the difference between `call`, `apply`, and `bind`?**
A: All three set `this` explicitly. `call` invokes immediately with args as a list; `apply` invokes immediately with args as an array; `bind` returns a new function with `this` bound without calling it.

**Q: What are WeakMap and WeakSet used for?**
A: They hold weak references to objects, allowing garbage collection when the object has no other references. Used for caches tied to DOM nodes, private data, or metadata without preventing GC.

**Q: What is `typeof null` and why?**
A: `typeof null === "object"`. This is a JS bug from version 1 that was never fixed for backward compatibility. Use `value === null` to check for null.

**Q: What is event delegation?**
A: Attaching a single event listener to a parent element and handling events from children via `event.target`. Efficient for dynamic lists because you don't need to reattach listeners when items are added.

**Q: What are generators used for?**
A: Generators produce lazy, on-demand sequences. They pause at `yield` and resume on `.next()`. Used for infinite sequences, async flow control, and custom iterators.

**Q: Difference between `for...in` and `for...of`?**
A: `for...in` iterates over enumerable property keys of an object (including inherited). `for...of` iterates over iterable values (arrays, strings, Maps, Sets). Use `for...of` for arrays.

---

### React Q&A

**Q: What is the Virtual DOM?**
A: An in-memory JS object representation of the real DOM. React diffs the new Virtual DOM against the previous one after state changes and applies only the minimal real DOM mutations needed.

**Q: What are React hooks and why were they introduced?**
A: Hooks let functional components use state and lifecycle features. They were introduced to avoid class components' complexity (`this` binding, lifecycle method fragmentation) and enable logic reuse via custom hooks.

**Q: When does a React component re-render?**
A: When its own state changes, when its parent re-renders, or when a context it consumes changes. `React.memo` can prevent re-renders if props are unchanged (shallow compare).

**Q: What is the dependency array in `useEffect`?**
A: Controls when the effect re-runs. Empty `[]` = run once on mount. `[dep]` = run when `dep` changes. No array = run after every render. Every reactive value used inside the effect should be listed.

**Q: Difference between `useMemo` and `useCallback`?**
A: `useMemo` memoizes a **computed value**; `useCallback` memoizes a **function reference**. `useCallback(fn, deps)` is equivalent to `useMemo(() => fn, deps)`.

**Q: What is a controlled component?**
A: A component where React state is the single source of truth for the input value. The input's `value` is bound to state, and `onChange` updates state. Contrast with uncontrolled components where the DOM holds the value.

**Q: What is the key prop and why does it matter?**
A: `key` helps React identify list items during reconciliation. Without a stable key, React may reuse the wrong DOM nodes, causing state bugs. Never use array index as key when the list can reorder or filter.

**Q: What are Error Boundaries?**
A: Class components that catch JS errors in their subtree and render a fallback UI instead of crashing. Implemented via `getDerivedStateFromError` and `componentDidCatch`.

**Q: What is `useReducer` and when should you use it over `useState`?**
A: `useReducer` is like `useState` but manages state transitions via a `(state, action) => newState` reducer function. Prefer it when state has complex logic, multiple related values, or transitions depend on previous state.

**Q: What is `React.memo`?**
A: A HOC that wraps a component and skips re-rendering if its props haven't changed (shallow comparison). Only useful if the parent actually re-renders frequently AND the child is expensive to render.

**Q: What is a Portal?**
A: `ReactDOM.createPortal(children, domNode)` renders children into a DOM node outside the parent's DOM hierarchy. Used for modals, tooltips, and dropdowns that must visually escape parent overflow/z-index.

**Q: How does `forwardRef` work?**
A: `React.forwardRef((props, ref) => ...)` lets a parent pass a ref to a DOM node inside a child component. Without it, refs point to the component instance, not the internal DOM node.

**Q: What are the rules of hooks?**
A: 1) Only call hooks at the top level — not inside loops, conditions, or nested functions. 2) Only call hooks from React function components or custom hooks.

**Q: What is `useLayoutEffect` and when do you need it instead of `useEffect`?**
A: `useLayoutEffect` fires synchronously after DOM mutations but before the browser paints. Use it when you need to read layout (e.g., element dimensions) and synchronously update state to avoid a flash.

---

### General Front-End Q&A

**Q: Explain the browser rendering pipeline.**
A: Parse HTML → build DOM; parse CSS → build CSSOM; combine → Render Tree; Layout (calculate geometry); Paint (fill pixels); Composite (layer ordering). JS can trigger reflow (layout recalculation) and repaint.

**Q: What is CORS?**
A: Cross-Origin Resource Sharing. Browsers block cross-origin requests by default. Servers opt-in by sending `Access-Control-Allow-Origin` headers. Preflight requests (OPTIONS) are sent first for non-simple requests.

**Q: What are the Core Web Vitals?**
A: LCP (Largest Contentful Paint) — loading performance; CLS (Cumulative Layout Shift) — visual stability; INP (Interaction to Next Paint) — responsiveness. Measured in real user data.

**Q: What is CSS specificity?**
A: The weight of a selector. Order (low to high): element/pseudo-element → class/attribute/pseudo-class → ID → inline style → `!important`. Equal specificity: last declaration wins.

**Q: Explain Flexbox vs Grid.**
A: Flexbox is 1D — aligns items along a single axis (row or column). Grid is 2D — controls both rows and columns. Use Flexbox for components/nav bars; use Grid for page layouts.

**Q: What is `position: sticky`?**
A: An element acts as `position: relative` until it crosses a scroll threshold, then becomes `position: fixed` within its containing block. Useful for sticky headers in scrollable tables.

**Q: What is semantic HTML and why does it matter?**
A: Using HTML elements that convey meaning (`<nav>`, `<main>`, `<article>`, `<button>`) rather than generic `<div>`s. Improves accessibility (screen readers), SEO, and maintainability.

**Q: What HTTP methods do you know?**
A: `GET` (read), `POST` (create), `PUT` (replace), `PATCH` (partial update), `DELETE` (remove), `OPTIONS` (preflight/CORS), `HEAD` (like GET but no body).

**Q: Common HTTP status codes?**
A: 200 OK, 201 Created, 204 No Content, 301 Moved Permanently, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 422 Unprocessable Entity, 429 Too Many Requests, 500 Internal Server Error.

**Q: What is the difference between `localStorage`, `sessionStorage`, and cookies?**
A: `localStorage` — persists until cleared, ~5MB, not sent with requests. `sessionStorage` — cleared on tab close, ~5MB, not sent with requests. Cookies — sent with every request, ~4KB, configurable expiry, accessible server-side. Use cookies for auth tokens (with `HttpOnly`/`Secure` flags).
