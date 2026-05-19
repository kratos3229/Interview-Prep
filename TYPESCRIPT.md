# TypeScript Reference Guide

A structured reference covering TypeScript fundamentals — from basic types to classes, interfaces, and beyond.

---

## Table of Contents

| # | Topic |
|---|-------|
| 1 | [Type Aliases](#1-type-aliases) |
| 2 | [Interfaces](#2-interfaces) |
| 3 | [Type Aliases vs Interfaces](#3-type-aliases-vs-interfaces) |
| 4 | [Literal Types](#4-literal-types) |
| 5 | [Functions](#5-functions) |
| 6 | [Function Type Aliases](#6-function-type-aliases) |
| 7 | [Optional Parameters](#7-optional-parameters) |
| 8 | [Rest Parameters](#8-rest-parameters) |
| 9 | [The `never` Type](#9-the-never-type) |
| 10 | [Type Assertions](#10-type-assertions) |
| 11 | [DOM Typing & Non-Null Assertion](#11-dom-typing--non-null-assertion) |
| 12 | [Classes](#12-classes) |
| 13 | [Inheritance](#13-inheritance) |
| 14 | [Classes Implementing Interfaces](#14-classes-implementing-interfaces) |
| 15 | [Static Members](#15-static-members) |
| 16 | [Getters and Setters](#16-getters-and-setters) |
| 17 | [Index Signatures](#17-index-signatures) |
| 18 | [keyof](#18-keyof) |
| 19 | [Quick Reference Cheatsheet](#19-quick-reference-cheatsheet) |

---

## 1. Type Aliases

`type` creates a reusable name for any type expression. Unlike interfaces, type aliases can represent primitives, unions, tuples, intersections, and more — not just object shapes.

```ts
type StringOrNumber = string | number;

// Array where each element can be string or number
type StringOrNumberArray = (string | number)[];

// Alias for a specific primitive
type UserId = string | number;
```

**When to reach for `type`:** Unions, intersections, tuples, primitives, or any type that isn't purely an object shape.

---

## 2. Interfaces

Interfaces define the **shape of an object**. They describe what properties an object must have and what types those properties must be.

```ts
interface Guitarist {
  name: string;        // required property
  active?: boolean;    // "?" makes this property optional — can be boolean or undefined
  albums: (string | number)[];
}

// Using the interface
const jimmy: Guitarist = {
  name: "Jimmy Page",
  albums: ["Led Zeppelin I", "Led Zeppelin IV"],
};
```

Interfaces are **extendable** — you can build on them with `extends`:

```ts
interface Animal {
  name: string;
}

interface Dog extends Animal {
  breed: string; // Dog has both `name` (from Animal) and `breed`
}
```

**Declaration merging:** You can declare the same interface twice and TypeScript merges them. This does NOT work with `type`.

```ts
interface Window {
  myCustomProp: string;
}
// TypeScript now knows Window has myCustomProp — useful for augmenting global types
```

---

## 3. Type Aliases vs Interfaces

Both can describe object shapes. The differences matter at the edges:

| Feature | `type` | `interface` |
|---|---|---|
| Object shapes | Yes | Yes |
| Primitives & unions | Yes | No |
| Tuples | Yes | No |
| Extends / inherits | Via `&` intersection | Via `extends` keyword |
| Declaration merging | No (error on duplicate) | Yes (auto-merged) |
| `implements` in classes | Yes | Yes |
| Preferred for... | Unions, primitives, computed types | Object shapes, class contracts |

```ts
// Only works as a type alias — interfaces can't do this
type UserId = string | number;
type Direction = "up" | "down" | "left" | "right";
type Pair = [string, number]; // tuple

// interface UserId = string | number;  ← ERROR — interfaces describe objects only
```

**Rule of thumb:** Use `interface` for objects and class contracts. Use `type` for everything else.

---

## 4. Literal Types

A literal type restricts a variable to **one exact value**, not just a broad type like `string`. Think of it as the most specific possible type.

```ts
// This variable can ONLY ever hold the string "Poo"
let myName: "Poo";
myName = "Poo";     // fine
// myName = "NotPoo"; // Error: Type '"NotPoo"' is not assignable to type '"Poo"'
```

Combine literals with `|` to allow a **fixed set of values** — great for status codes, directions, roles:

```ts
let userName: "Poo" | "Poo2" | "Poo3";
userName = "Poo2";  // valid
// userName = "Poo4"; // Error: not in the allowed set

type Direction = "up" | "down" | "left" | "right";
type Status = "pending" | "active" | "inactive";
type Role = "admin" | "user" | "guest";
```

**`as const` — turning objects into literal types:**

```ts
const config = {
  endpoint: "/api",
  port: 3000,
} as const;
// config.endpoint is now the literal type "/api", not just string
// config.port is 3000, not just number — and both are readonly
```

---

## 5. Functions

TypeScript lets you annotate **parameter types** and **return types**. If you don't annotate the return type, TypeScript infers it.

```ts
// Arrow function — explicit param and return types
const add = (a: number, b: number): number => {
  return a + b;
};

// "void" means the function returns nothing useful
// (it may return undefined, but callers shouldn't rely on the value)
const logMsg = (message: any): void => {
  console.log(message);
};

// Traditional function expression — same rules apply
let subtract = function (c: number, d: number): number {
  return c - d;
};
```

**Return type inference:** TypeScript can usually infer the return type, but being explicit is good practice — it catches bugs when the function accidentally returns the wrong type.

**`any` vs `unknown`:**

| | `any` | `unknown` |
|---|---|---|
| Bypasses type checking | Yes | No |
| Must narrow before use | No | Yes |
| Safe to use | Risky | Safer |

Prefer `unknown` over `any` when you don't know the type up front — it forces you to check before using the value:

```ts
function safeParse(input: unknown): string {
  if (typeof input === "string") return input; // narrowed to string
  return String(input);
}
```

---

## 6. Function Type Aliases

You can describe a function's **signature** as a reusable `type` or `interface`. This lets you type variables, parameters, and return values that hold functions.

```ts
// Type alias for a function signature
type MathFunction = (a: number, b: number) => number;

// Interface syntax for the same thing (less common)
interface MathFunction2 {
  (a: number, b: number): number;
}

// When you assign a function to a typed variable,
// TypeScript infers the param types from the alias — no need to repeat them
let multiply: MathFunction = function (c, d) {
  return c * d; // c and d are inferred as number from MathFunction
};

// Useful for callbacks too
function applyOperation(a: number, b: number, op: MathFunction): number {
  return op(a, b);
}

applyOperation(10, 5, (a, b) => a - b); // TypeScript infers a and b are number
```

---

## 7. Optional Parameters

Adding `?` after a parameter name makes it **optional** — it can be the declared type or `undefined`. TypeScript will NOT let you use it without checking first — that check is called a **type guard**.

```ts
const addAll = (a: number, b: number, c?: number): number => {
  if (typeof c !== "undefined") return a + b + c; // type guard narrows c from number|undefined → number
  return a + b;
};

addAll(1, 2);    // fine — c is undefined
addAll(1, 2, 3); // fine — c is 3
```

**Default parameters** are a cleaner alternative when you have a sensible fallback:

```ts
// Default value: c is always a number, defaults to 10
const addWithDefault = (a: number, b: number, c: number = 10): number => {
  return a + b + c;
};

addWithDefault(1, 2);    // 13 — c defaults to 10
addWithDefault(1, 2, 5); // 8
```

**Rule:** Optional parameters must come after required ones. `(a?: number, b: number)` is an error.

---

## 8. Rest Parameters

`...name` collects any number of extra arguments into an **array**. The type annotation goes on the array element type.

```ts
const total = (...nums: number[]): number => {
  return nums.reduce((prev, curr) => prev + curr);
};

total(1, 2, 3, 4, 5); // 15 — all args collected into nums array
```

You can combine regular params with rest — rest must always come last:

```ts
const greetAll = (greeting: string, ...names: string[]): void => {
  names.forEach(name => console.log(`${greeting}, ${name}!`));
};

greetAll("Hello", "Alice", "Bob", "Charlie");
```

---

## 9. The `never` Type

`never` means a function **literally never returns** — it either throws an error or runs forever. It is stricter than `void` (which just means "no useful return value").

```ts
// Throws — never returns normally
const createError = (errMsg: string): never => {
  throw new Error(errMsg);
};

// Infinite loop — never returns
const infinite = (): never => {
  let i = 1;
  while (true) { i++; }
};
```

**Exhaustiveness checking with `never`:**

`never` shines in `switch` statements over union types. If you add a new member to a union and forget to handle it, TypeScript will error on the `never` line:

```ts
type Shape = "circle" | "square" | "triangle";

function describeShape(shape: Shape): string {
  if (shape === "circle")   return "round";
  if (shape === "square")   return "boxy";
  if (shape === "triangle") return "pointy";
  return createError(`Unhandled shape: ${shape}`);
  // If you add "hexagon" to Shape but forget to handle it above,
  // TypeScript errors here because `shape` can't be `never` anymore
}
```

**`void` vs `never` summary:**

| | `void` | `never` |
|---|---|---|
| Returns | `undefined` (implicitly) | Never returns at all |
| Typical use | Functions with no return value | Throwing functions, infinite loops |
| Assignable from | `undefined` | Nothing (it's the bottom type) |

---

## 10. Type Assertions

Type assertions tell TypeScript **"trust me, I know the type of this value."** They don't change the runtime value — they only affect the type checker. Use them when you know more than TypeScript can infer.

```ts
type One   = string;
type Two   = string | number;
type Three = "hello"; // literal type

let a: One = "hello";

// "as" syntax — two directions:
let b = a as Two;   // widening: less specific  (string → string | number)
let c = a as Three; // narrowing: more specific (string → "hello")

// Angle-bracket syntax — identical to "as"
let d = <One>"World";
let e = <string | number>"World";
```

> **Warning:** Angle-bracket assertions **cannot be used in `.tsx` files** (React/JSX) because `<Type>` looks like a JSX element. Always use `as` in those files.

**The assertion pitfall — lying to TypeScript:**

```ts
const addOrConcat = (a: number, b: number, c: "add" | "concat"): number | string => {
  if (c === "add") return a + b;
  return "" + a + b; // returns "22", a string
};

let myVal: string = addOrConcat(2, 2, "concat") as string; // correct assertion
let nextVal: number = addOrConcat(2, 2, "concat") as number; // compiles, but WRONG at runtime — returns "22"
```

TypeScript trusts your assertion. If you lie, it won't catch the mistake — you get a runtime bug. **Use assertions sparingly.**

**Double assertion** — when TypeScript won't allow a direct assertion, you can force it via `unknown`:
```ts
const x = "hello" as unknown as number; // valid, but a red flag if you're doing this
```

---

## 11. DOM Typing & Non-Null Assertion

TypeScript doesn't know the contents of the DOM at compile time, so DOM query methods return broad or nullable types by default.

```ts
// querySelector returns Element | null
// "as HTMLImageElement" tells TypeScript the exact element type
const img = document.querySelector("img") as HTMLImageElement;
// Now TypeScript knows img has .src, .alt, .width, etc.

// getElementById returns HTMLElement | null
// "!" is the non-null assertion — removes the null from the type
const myImg = document.getElementById("myImg")!;
// Type is now HTMLElement, not HTMLElement | null

// Angle-bracket assertion — same result as "as"
const nextImg = <HTMLImageElement>document.getElementById("myImg");
```

**When to use `!` vs `as`:**
- Use `!` when you're confident the element exists but don't need to specify the subtype
- Use `as HTMLImageElement` when you need access to subtype-specific properties (`.src`, `.alt`)
- Prefer a runtime check when you're not sure the element exists:

```ts
const el = document.getElementById("myImg");
if (el instanceof HTMLImageElement) {
  el.src = "photo.jpg"; // TypeScript now knows it's HTMLImageElement inside this block
}
```

---

## 12. Classes

TypeScript extends JavaScript classes with **access modifiers**, **parameter properties**, and stronger type checking.

### Access Modifiers

| Modifier | Accessible from |
|---|---|
| `public` | Anywhere (default) |
| `private` | Inside this class only |
| `protected` | This class + subclasses |
| `readonly` | Anywhere (read), set once in constructor |

### Parameter Properties

Declaring a constructor parameter with an access modifier **automatically creates and assigns** the property — no need for manual `this.x = x`.

```ts
class Coder {
  secondLang!: string; // "!" = definite assignment assertion — assigned later, not in constructor

  constructor(
    public readonly name: string,           // creates this.name (readonly)
    public music: string,                   // creates this.music
    private age: number,                    // creates this.age (private)
    protected lang: string = "TypeScript",  // creates this.lang with a default value
  ) {
    // The manual assignments below are redundant when using parameter properties
    // TypeScript already handles them. They're harmless but unnecessary.
    this.name = name;
    this.music = music;
    this.age = age;
    this.lang = lang;
  }

  public getAge(): string {
    return `Hello, I'm ${this.age}`; // fine — age is accessible inside the class
  }
}

const Poo = new Coder("Poo", "Rock", 42);
console.log(Poo.getAge()); // works — public method
// console.log(Poo.age);   // ERROR — age is private
// Poo.name = "Other";     // ERROR — name is readonly
```

**Definite assignment assertion (`!`):** Tells TypeScript "I guarantee this will be assigned before it's used, even though I'm not doing it in the constructor." Without it, TypeScript would error because `secondLang` is never set in the constructor.

---

## 13. Inheritance

`extends` creates a subclass that **inherits** all `public` and `protected` members from the parent. `private` members are inherited but not accessible in the subclass.

```ts
class WebDev extends Coder {
  constructor(
    public computer: string, // new property — belongs to WebDev only
    name: string,            // no modifier = just a constructor arg, forwarded to super()
    music: string,
    age: number,
  ) {
    super(name, music, age); // MUST be called first — initializes the parent's properties
    this.computer = computer;
  }

  public getLang(): string {
    return `I write ${this.lang}`; // `lang` is protected in Coder, so accessible here
  }
}

const Sara = new WebDev("Mac", "Sara", "Lofi", 25);
Sara.getLang(); // "I write TypeScript"
```

**Key rules:**
- `super()` must be the **first statement** in a child constructor
- Parameters without access modifiers in the child constructor are just local args, NOT new properties
- `private` in the parent = invisible to the child (use `protected` if the child needs access)

**Method overriding:** A subclass can redefine a parent method with `override` (TypeScript 4.3+):

```ts
class SeniorDev extends Coder {
  override getAge(): string {
    return `Experienced developer`; // replaces the parent's implementation
  }
}
```

---

## 14. Classes Implementing Interfaces

`implements` enforces that a class fulfills an interface's **contract**. If the class is missing any required property or method, TypeScript errors.

```ts
interface Musician {
  name: string;
  instrument: string;
  play(action: string): string; // method signature — class must implement this
}

class Guitarist implements Musician {
  name: string;
  instrument: string;

  constructor(name: string, instrument: string) {
    this.name = name;
    this.instrument = instrument;
  }

  play(action: string): string {
    return `${this.name} ${action} the ${this.instrument}`;
  }
}

const Page = new Guitarist("Jimmy", "guitar");
Page.play("strum"); // "Jimmy strum the guitar"
```

**`extends` vs `implements`:**

| | `extends` | `implements` |
|---|---|---|
| Inherits code | Yes | No |
| Inherits types | Yes | No |
| Can use multiple | No (one parent) | Yes (multiple interfaces) |
| Works with | Classes only | Classes + type aliases |

```ts
// A class can do both at once
class ElectricGuitarist extends Guitarist implements Musician, Performer {
  // ...
}
```

---

## 15. Static Members

Static properties and methods **belong to the class itself**, not to any instance. All instances share the same static value.

Access them via the **class name** — not `this` or an instance variable.

```ts
class Peeps {
  static count: number = 0; // lives on the class, shared across all instances

  static getCount(): number {
    return Peeps.count; // accessed via class name
  }

  public id: number;

  constructor(public name: string) {
    this.id = ++Peeps.count; // increments shared counter, assigns unique id to this instance
  }
}

const John  = new Peeps("John");  // Peeps.count = 1, John.id  = 1
const Steve = new Peeps("Steve"); // Peeps.count = 2, Steve.id = 2
const Amy   = new Peeps("Amy");   // Peeps.count = 3, Amy.id   = 3

console.log(Peeps.getCount()); // 3
```

**Common use cases:**
- Instance counters
- Singleton patterns
- Factory methods (alternative constructors)
- Utility/helper methods that don't need instance state

**Static factory method pattern:**

```ts
class Color {
  private constructor(public r: number, public g: number, public b: number) {}

  static fromHex(hex: string): Color {
    // parse hex and return a new Color
    return new Color(255, 0, 0); // simplified
  }
}

const red = Color.fromHex("#FF0000"); // alternative constructor via static method
```

---

## 16. Getters and Setters

Getters and setters let you expose a property with **controlled read/write access**. From the outside they look like plain properties, but they execute functions under the hood.

```ts
class Bands {
  private dataState: string[]; // backing field — the real storage, hidden from outside

  constructor() {
    this.dataState = [];
  }

  // Called when you READ bands.data
  public get data(): string[] {
    return this.dataState;
  }

  // Called when you WRITE bands.data = [...]
  public set data(value: string[]) {
    if (Array.isArray(value) && value.every((el) => typeof el === "string")) {
      this.dataState = value; // validation passed — store it
      return;
    }
    throw new Error("Param is not an array of strings");
  }
}

const myBands = new Bands();
myBands.data = ["Alice in Chains", "Nirvana"]; // calls setter — validation runs
console.log(myBands.data);                      // calls getter — ["Alice in Chains", "Nirvana"]
// myBands.data = [1, 2, 3];                    // throws Error
```

**Why use getters/setters over a plain public property?**
- **Validation on write** — reject bad data before it's stored
- **Computed values on read** — transform or derive data before returning
- **Encapsulation** — keep the actual storage private while exposing a clean API
- **Lazy initialization** — compute a value only when first accessed

**Getter-only (computed read-only property):**
```ts
class Circle {
  constructor(public radius: number) {}

  get area(): number {
    return Math.PI * this.radius ** 2; // computed on every read
  }
}
```

---

## 17. Index Signatures

An index signature tells TypeScript: **"this object can have any number of keys of a given type, and all their values will be this type."**

```ts
interface TransactionObj {
  [index: string]: number; // any string key → number value
  Pizza: number;           // explicitly named keys are still valid (they satisfy the index signature)
  Books: number;
  Job: number;
}

const todaysTransactions: TransactionObj = {
  Pizza: -10,
  Books: -5,
  Job: 50,
};

// Dynamic key access is now type-safe
todaysTransactions["Pizza"];     // -10
todaysTransactions["anything"];  // type is `number`, but value is undefined at runtime
```

**The compatibility constraint:** When you combine an index signature with named properties, the named property types must all be **assignable to** the index signature's value type.

```ts
interface Broken {
  [index: string]: number;
  name: string; // ERROR — string is not assignable to number
}

interface Fixed {
  [index: string]: string | number; // widen the value type to accommodate both
  name: string;  // fine — string is assignable to string | number
  age: number;   // fine — number is assignable to string | number
}
```

**Number index signatures:** Arrays use `number` as the index type:

```ts
interface StringArray {
  [index: number]: string;
}
// This is essentially how Array<string> works under the hood
```

---

## 18. keyof

When you loop over an object's keys with `for...in` or `Object.keys()`, TypeScript types each key as `string` — it doesn't know which specific keys exist on the object. That means using the key to index back into the object will error.

**The fix:** cast with `keyof` to narrow `string` down to the exact union of valid keys.

```ts
interface Student {
  name: string;
  gpa: number;
  classes?: number[];
}

const student: Student = { name: "Doug", gpa: 3.5, classes: [100, 200] };

// for...in — key is `string`, too broad to index Student
for (const key in student) {
  // key as keyof Student narrows to "name" | "gpa" | "classes"
  console.log(`${key}: ${student[key as keyof Student]}`);
}

// Object.keys() — same problem, same fix
Object.keys(student).forEach((key) => {
  // keyof typeof student derives the union from the variable, not the interface name
  console.log(student[key as keyof typeof student]);
});
```

**`keyof` in generic functions** — the most powerful use:

```ts
// This function works on ANY object and only accepts keys that actually exist on it
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

getProperty(student, "name");  // returns string — TypeScript knows the type
getProperty(student, "gpa");   // returns number
// getProperty(student, "xyz"); // ERROR — "xyz" is not a key of Student
```

**`keyof` vs index signature:**

| | Index signature | `keyof` |
|---|---|---|
| Allows any key | Yes | No — only existing keys |
| Type safety | Weaker | Stronger |
| Use when | Keys are truly dynamic | Keys are known at compile time |

---

## 19. Quick Reference Cheatsheet

### Primitive Types
```ts
let name: string = "Alice";
let age: number = 30;
let active: boolean = true;
let nothing: null = null;
let missing: undefined = undefined;
let id: symbol = Symbol("id");
let big: bigint = 100n;
```

### Common Type Constructs
```ts
// Union — one of several types
type ID = string | number;

// Intersection — all of several types combined
type Admin = User & { adminLevel: number };

// Tuple — fixed-length array with specific types per position
type Point = [number, number];
type NameAge = [string, number];

// Optional chaining safe access
const city = user?.address?.city;

// Nullish coalescing — fallback only on null/undefined (not 0 or "")
const display = username ?? "Guest";
```

### Utility Types
TypeScript ships built-in generic types that transform other types:

```ts
interface User { id: number; name: string; email: string; }

Partial<User>         // all properties become optional
Required<User>        // all properties become required
Readonly<User>        // all properties become readonly
Pick<User, "id" | "name">     // only keep listed properties
Omit<User, "email">           // remove listed properties
Record<string, number>        // object with string keys and number values
Exclude<"a" | "b" | "c", "a"> // removes "a" → "b" | "c"
ReturnType<typeof myFn>       // extracts the return type of a function
```

### Generics — Brief Intro
Generics let you write **reusable, type-safe** functions and classes that work across many types without losing type information:

```ts
// Without generics — loses the specific type
function identity(arg: any): any { return arg; }

// With generics — preserves the type
function identity<T>(arg: T): T { return arg; }

identity("hello");   // T = string, return type is string
identity(42);        // T = number, return type is number
identity([1, 2, 3]); // T = number[], return type is number[]
```

### Type Guard Patterns
```ts
// typeof — for primitives
if (typeof x === "string") { /* x is string here */ }

// instanceof — for class instances
if (x instanceof Date) { /* x is Date here */ }

// in — for checking if a property exists
if ("fly" in animal) { /* animal has a fly property */ }

// Custom type predicate
function isString(val: unknown): val is string {
  return typeof val === "string";
}
```
