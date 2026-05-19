# React Concepts

## Table of Contents

- [Virtual DOM](#virtual-dom)
- [Reconciliation](#reconciliation)
- [React Fiber](#react-fiber)
- [JSX](#jsx)
- [Hooks](#hooks)
  - [useState](#usestate)

---

## Virtual DOM

### What is it?

The Virtual DOM (VDOM) is a lightweight, in-memory JavaScript representation of the real DOM. It's a plain object tree that mirrors the structure of the actual browser DOM.

When you write JSX like `<div className="box"><p>Hello</p></div>`, React translates it into a plain object:

```js
{
  type: 'div',
  props: { className: 'box' },
  children: [
    { type: 'p', props: {}, children: ['Hello'] }
  ]
}
```

### Why does it exist?

Direct DOM manipulation is expensive — reading/writing to the real DOM triggers layout recalculations, repaints, and reflows in the browser. The VDOM lets React batch and minimize real DOM operations by first computing changes in memory (cheap), then applying only the necessary mutations to the real DOM (expensive, but minimized).

### How it works (high level)

1. React builds a VDOM tree from your component's render output.
2. On state/prop change, React builds a **new** VDOM tree.
3. React **diffs** the old tree against the new tree (reconciliation).
4. Only the changed nodes get written to the real DOM.

### Common misconception

The VDOM is not inherently faster than the real DOM. It's faster than naive DOM manipulation (e.g., re-rendering an entire list on every change). The benefit is the diffing/batching strategy, not the VDOM itself.

---

## Reconciliation

### What is it?

Reconciliation is the algorithm React uses to determine **what changed** between two VDOM trees so it knows the minimum set of real DOM updates to make.

### The diffing algorithm

Comparing two arbitrary trees naively is O(n³). React uses heuristics to bring this down to **O(n)**:

#### Heuristic 1 — Elements of different types produce different trees

If the root element type changes (e.g., `<div>` → `<span>`), React tears down the old tree entirely and builds a new one from scratch. All child components unmount and remount.

```jsx
// Before
<div><Counter /></div>

// After — Counter unmounts and remounts completely
<span><Counter /></span>
```

#### Heuristic 2 — Keys identify stable elements across renders

When rendering lists, React uses `key` to match elements between renders. Without keys, React diffs by position, which causes incorrect updates and performance issues.

```jsx
// Bad — React diffs by index; inserting at top causes every item to re-render
items.map(item => <Item value={item} />)

// Good — React matches by key; only the new item renders
items.map(item => <Item key={item.id} value={item} />)
```

**Keys must be stable, unique, and not array indexes** (unless the list never reorders or changes).

#### Heuristic 3 — Same type, same position → update in place

If the element type is the same, React keeps the underlying DOM node and only updates changed attributes/props.

```jsx
// Before
<div className="old" style={{ color: 'red' }} />

// After — React patches className and style, doesn't recreate the div
<div className="new" style={{ color: 'blue' }} />
```

### Component reconciliation

- **Class components**: React updates props/state and calls `render()`.
- **Function components**: React re-calls the function.
- If a component returns the same element type at the same position, the instance (and its state) is preserved.

### When does reconciliation run?

- `setState` / `useState` setter called
- Props change from parent re-render
- `forceUpdate` (class components)
- Context value changes

---

## React Fiber

### What is it?

Fiber is React's internal reconciliation engine, introduced in React 16. It's a complete rewrite of the old stack-based reconciler.

The core idea: **make rendering interruptible**.

### The problem with the old stack reconciler

React's pre-16 reconciler was synchronous and recursive. Once it started rendering a component tree, it couldn't stop until it finished — like a function call stack you can't pause. On large trees, this blocked the main thread and caused dropped frames, janky animations, and unresponsive inputs.

### What Fiber does differently

Fiber converts the recursive tree walk into an **iterative, linked-list traversal** that can be paused, resumed, aborted, or restarted.

Each component in the tree becomes a **Fiber node** — a plain JavaScript object that represents a unit of work:

```js
{
  type,          // function/class/host element type
  key,
  stateNode,     // the actual DOM node or class instance
  child,         // first child fiber
  sibling,       // next sibling fiber
  return,        // parent fiber
  pendingProps,
  memoizedProps,
  memoizedState,
  effectTag,     // what DOM operation is needed (insert, update, delete)
  alternate,     // points to the previous version of this fiber (double buffering)
}
```

### Two-phase rendering

Fiber splits work into two phases:

#### Phase 1 — Render / Reconciliation (interruptible)

React walks the fiber tree, calls render functions, and builds a **work-in-progress tree** (a draft of changes). This phase can be paused and resumed. No side effects are committed here.

This is where `useMemo`, `useCallback`, and render logic run.

#### Phase 2 — Commit (synchronous, cannot be interrupted)

React takes the finished work-in-progress tree and applies all DOM mutations in one synchronous pass. This is where `useEffect` and `useLayoutEffect` cleanup/setup runs.

### Double buffering

Fiber maintains two trees at all times:
- **Current tree** — what's currently rendered in the DOM
- **Work-in-progress tree** — the next render being computed

When the work-in-progress tree is complete, it becomes the new current tree. This lets React build the next UI in memory without touching the real DOM until it's ready — similar to double buffering in graphics.

### Priorities and scheduling (Concurrent Mode)

Fiber assigns a **priority** (called a "lane" in modern React) to each unit of work:

| Priority | Example |
|---|---|
| Immediate | Controlled inputs, error boundaries |
| High | User interactions (clicks, keypresses) |
| Normal | Data fetching transitions |
| Low | Analytics, prefetching |
| Idle | Off-screen content |

React can interrupt low-priority work to handle high-priority updates, then resume or discard the interrupted work.

This powers APIs like `useTransition`, `useDeferredValue`, and `Suspense`.

### Fiber in practice — what you see as a developer

You don't interact with Fiber directly, but it's why these things work:

- **`useTransition`** — marks a state update as non-urgent so React can keep the UI responsive during slow renders
- **`useDeferredValue`** — defers re-rendering a value until the browser is idle
- **`Suspense`** — lets React pause rendering a subtree while waiting for async data, show a fallback, then resume
- **Concurrent features** — rendering can happen off-screen without blocking user interactions

### Summary: How the three concepts connect

```
State/prop change
      ↓
React creates a new VDOM tree (Virtual DOM)
      ↓
Fiber walks both trees and finds differences (Reconciliation)
      ↓
Fiber schedules and commits the minimal set of real DOM updates
```

The **Virtual DOM** is the data structure.  
**Reconciliation** is the diffing algorithm.  
**Fiber** is the engine that runs reconciliation in a way that's interruptible and priority-aware.

---

## JSX

### What is it?

JSX (JavaScript XML) is a syntax extension for JavaScript that lets you write HTML-like markup inside JS files. It is **not** valid JavaScript — it must be compiled by a tool like Babel or the TypeScript compiler before the browser can run it.

```jsx
// What you write
const el = <h1 className="title">Hello, world!</h1>;

// What the compiler produces (React 17+ automatic runtime)
import { jsx as _jsx } from 'react/jsx-runtime';
const el = _jsx('h1', { className: 'title', children: 'Hello, world!' });
```

JSX is purely syntactic sugar. There is no JSX at runtime — it's all function calls.

### JSX → `React.createElement` (pre React 17)

Before the automatic JSX transform, every JSX file needed `import React from 'react'` at the top because JSX compiled to `React.createElement` calls:

```jsx
// JSX
const el = <div className="box"><p>Hello</p></div>;

// Compiled output (classic runtime)
const el = React.createElement(
  'div',
  { className: 'box' },
  React.createElement('p', null, 'Hello')
);
```

`React.createElement(type, props, ...children)` returns a plain React element object — this is what populates the Virtual DOM.

### JSX → `jsx()` (React 17+ automatic runtime)

React 17 introduced the automatic JSX transform. You no longer need to import React in every file. The compiler imports from `react/jsx-runtime` automatically.

```jsx
// No import needed — compiler adds it
function App() {
  return <h1>Hello</h1>;
}
```

### Rules of JSX

#### 1. Return a single root element

JSX expressions must have one root. Use a wrapper `<div>` or a **Fragment** to group multiple elements without adding extra DOM nodes.

```jsx
// Bad — two root elements
return (
  <h1>Title</h1>
  <p>Paragraph</p>
);

// Good — Fragment (short syntax)
return (
  <>
    <h1>Title</h1>
    <p>Paragraph</p>
  </>
);
```

Use `<React.Fragment key={id}>` (not `<>`) when you need to attach a `key` prop to a fragment (e.g., inside a `.map()`).

#### 2. Close all tags

Self-closing tags that are valid in HTML (like `<img>`, `<input>`, `<br>`) must be explicitly closed in JSX.

```jsx
// Bad
<img src="photo.jpg">
<input type="text">

// Good
<img src="photo.jpg" />
<input type="text" />
```

#### 3. Use `className`, not `class`

HTML attributes that clash with JS reserved words are renamed:

| HTML | JSX |
|---|---|
| `class` | `className` |
| `for` | `htmlFor` |
| `tabindex` | `tabIndex` |
| `onclick` | `onClick` |

All event handler attributes are camelCase in JSX (`onChange`, `onSubmit`, `onKeyDown`).

#### 4. Expressions go in curly braces `{}`

Any valid JavaScript expression can be embedded in JSX with `{}`. Statements (like `if`, `for`) are not allowed directly — use expressions instead.

```jsx
const name = 'Poovanna';
const isLoggedIn = true;

return (
  <div>
    {/* String interpolation */}
    <p>Hello, {name}!</p>

    {/* Ternary (expression) — ok */}
    {isLoggedIn ? <Dashboard /> : <Login />}

    {/* && short-circuit — ok */}
    {isLoggedIn && <LogoutButton />}

    {/* if statement — NOT ok directly in JSX */}
    {/* if (isLoggedIn) { ... }  ← syntax error */}
  </div>
);
```

#### 5. Style is an object, not a string

Inline styles are passed as a JavaScript object with camelCase property names:

```jsx
// Bad — HTML string syntax doesn't work
<div style="color: red; font-size: 16px">

// Good — JS object with camelCase
<div style={{ color: 'red', fontSize: '16px' }}>
```

The outer `{}` is JSX expression interpolation. The inner `{}` is the object literal.

### JSX and children

`children` is just a prop. These are all equivalent:

```jsx
// Self-closing with children prop
<Button children="Click me" />

// Between tags
<Button>Click me</Button>

// Multiple children become an array
<ul>
  <li>One</li>
  <li>Two</li>
</ul>
// children = [<li>One</li>, <li>Two</li>]
```

### What JSX cannot do

- **Render `false`, `null`, `undefined`** — these render nothing (useful for conditional rendering)
- **Render objects directly** — `{myObject}` throws; you must stringify or destructure first
- **Use statements** — only expressions inside `{}`
- **Use `class` or `for`** — use `className` and `htmlFor`

```jsx
// Renders nothing — useful pattern
{isLoading && <Spinner />}   // if false, renders nothing
{error ?? null}              // null renders nothing

// Throws — can't render a plain object
{myObj}  // Error: Objects are not valid as a React child

// Fix — render a specific value from the object
{myObj.name}
```

### JSX is just JavaScript

Because JSX compiles to function calls, you can use it anywhere a JS expression is valid: variables, arrays, return values, ternaries, function arguments.

```jsx
// Store JSX in a variable
const header = <h1>My App</h1>;

// Build arrays of JSX
const items = ['a', 'b', 'c'].map(x => <li key={x}>{x}</li>);

// Pass JSX as a prop
<Modal title={<span className="bold">Confirm</span>}>...</Modal>

// Conditional assignment
const button = isAdmin ? <AdminButton /> : <UserButton />;
```

### Common interview questions

**Q: Why do we need `key` in lists?**  
Keys help React identify which items changed, were added, or removed during reconciliation. Without them React falls back to positional diffing, which is incorrect for reordered or dynamically inserted lists.

**Q: Why did JSX files need `import React` before React 17?**  
Because JSX compiled to `React.createElement(...)` — React had to be in scope. The new automatic transform imports from `react/jsx-runtime` instead, so no manual import is needed.

**Q: Is JSX required to use React?**  
No. You can call `React.createElement` directly. JSX is just developer ergonomics — it compiles away entirely.

**Q: What's a Fragment and why use it?**  
A Fragment (`<>...</>` or `<React.Fragment>`) groups elements without adding a DOM node. Useful when a component must return multiple siblings but you don't want an extra wrapper `<div>` in the DOM (which could break CSS grid/flex layouts or add unwanted semantics).

---

## Hooks

Hooks are functions that let function components tap into React features — state, lifecycle, context, refs, and more. They were introduced in React 16.8 to replace class component patterns.

**Rules of Hooks** (enforced by the `eslint-plugin-react-hooks` linter):
1. **Only call hooks at the top level** — never inside loops, conditions, or nested functions. React identifies hooks by call order; changing the number of hook calls between renders breaks the internal state tracking.
2. **Only call hooks from React function components or custom hooks** — not from plain JS functions.

---

## useState

### What is it?

`useState` is a hook that adds a piece of **local, reactive state** to a function component. When the state value changes, React re-renders the component with the new value.

```jsx
const [state, setState] = useState(initialValue);
```

- `state` — the current value
- `setState` — the setter function that triggers a re-render
- `initialValue` — the value on the first render only (ignored on subsequent renders)

### Basic example

```jsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
}
```

### How state updates work

Calling `setState` does **not** mutate the current value — it schedules a re-render with the new value. The current `state` variable is frozen for the rest of that render.

```jsx
const [count, setCount] = useState(0);

function handleClick() {
  setCount(count + 1); // schedules re-render with 1
  setCount(count + 1); // still uses count = 0, schedules re-render with 1 again
  // result: count becomes 1, not 2
}
```

React **batches** multiple `setState` calls in the same event handler and applies them in one re-render (React 18 batches everywhere, including inside `setTimeout` and promises).

### Functional updates

When the new state depends on the previous state, pass a **function** to the setter instead of a value. React guarantees the function receives the latest state, even across batched updates.

```jsx
// Unreliable — captures stale closure value
setCount(count + 1);
setCount(count + 1); // both use the same stale count

// Reliable — uses the actual latest state each time
setCount(prev => prev + 1);
setCount(prev => prev + 1); // count increments by 2 correctly
```

Always use the functional form when:
- You're updating state more than once in the same handler
- The update is inside `setTimeout`, `setInterval`, or an async callback
- The update is inside a `useEffect`

### Lazy initialization

If the initial state is expensive to compute (e.g., reading from `localStorage`, parsing a large structure), pass a **function** as the initial value. React calls it only on the first render.

```jsx
// Bad — runs on every render, result ignored after first
const [data, setData] = useState(expensiveComputation());

// Good — runs once on mount only
const [data, setData] = useState(() => expensiveComputation());
```

### Storing objects and arrays

`useState` does **not** deep-merge updates like `this.setState` in class components. You must spread the old value and override what changed.

```jsx
const [user, setUser] = useState({ name: 'Poo', age: 25 });

// Bad — replaces the whole object, losing other fields
setUser({ age: 26 });

// Good — spread first, then override
setUser(prev => ({ ...prev, age: 26 }));
```

Same for arrays — never mutate in place, always return a new array:

```jsx
const [items, setItems] = useState(['a', 'b', 'c']);

// Add
setItems(prev => [...prev, 'd']);

// Remove
setItems(prev => prev.filter(item => item !== 'b'));

// Update
setItems(prev => prev.map(item => item === 'a' ? 'A' : item));
```

### When React skips re-rendering

If you call `setState` with the same value as current state (compared with `Object.is`), React bails out and skips the re-render entirely.

```jsx
const [count, setCount] = useState(0);

setCount(0); // count is already 0 — React skips re-render
```

This is why mutating objects/arrays in state and setting them back doesn't trigger a re-render — the reference hasn't changed.

```jsx
const [items, setItems] = useState([1, 2, 3]);

// Bad — same array reference, React skips re-render
items.push(4);
setItems(items); // no re-render!

// Good — new array reference, React re-renders
setItems([...items, 4]);
```

### Multiple state variables vs one object

Prefer **separate `useState` calls** for values that change independently. Group into an object only when values always change together (e.g., form fields that submit as a unit).

```jsx
// Good — independent state, simpler updates
const [isOpen, setIsOpen] = useState(false);
const [count, setCount] = useState(0);

// Fine — fields always updated together as a form
const [form, setForm] = useState({ username: '', password: '' });
```

### State vs derived values

Don't store something in state if it can be computed from existing state or props during render. Derived state leads to sync bugs and stale values.

```jsx
// Bad — derived state that can go out of sync
const [items, setItems] = useState([]);
const [count, setCount] = useState(0); // must remember to update both

// Good — derive count during render
const [items, setItems] = useState([]);
const count = items.length; // always in sync, no extra state
```

### Common interview questions

**Q: What is the difference between `setState(value)` and `setState(prev => value)`?**  
The value form captures the state from the current render closure and can be stale if multiple updates are batched. The functional form receives the guaranteed latest state from React's queue — use it whenever the new state depends on the old state.

**Q: Why doesn't mutating state and calling `setState` always re-render?**  
`setState` uses `Object.is` to check if the new value is different. Mutating an object/array doesn't change its reference, so React sees the same value and skips the re-render.

**Q: What is the difference between `useState` and a plain variable?**  
A plain variable is reset to its initial value on every render — it doesn't persist. `useState` persists the value across renders and triggers a re-render when updated.

**Q: When would you use lazy initialization?**  
When the initial value is derived from an expensive computation (reading `localStorage`, parsing JSON, filtering a large list). Passing a function instead of a value ensures that computation runs only once on mount.
