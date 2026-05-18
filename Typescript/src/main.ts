// ============================================================
// TYPE ALIASES
// ============================================================

// "type" creates a reusable alias for any type expression.
// Unlike interfaces, type aliases can represent primitives,
// unions, tuples, and more — not just object shapes.

// Union type: a value that can be EITHER string OR number
// type stringOrNumber = string | number;

// Array of union types: each element can be string or number
// type stringOrNumberArray = (string | number)[];

// ============================================================
// INTERFACES
// ============================================================

// Interfaces define the shape of an object.
// They are similar to "type" for objects, but are extendable
// with "extends" and are preferred for describing class contracts.

// interface Guitarist {
//   name: string;       // required property
//   active?: boolean;   // "?" makes this property optional
//   albums: (string | number)[];
// }

// ============================================================
// TYPE ALIASES VS INTERFACES
// ============================================================

// Type aliases CAN represent primitives or unions directly.
// Interfaces CANNOT — they only describe object shapes.
// type UserId = stringOrNumber; // works as a type alias
// interface UserId = stringOrNumber; // would NOT work

// ============================================================
// LITERAL TYPES
// ============================================================

// A literal type restricts a variable to ONE exact value.
// This is more specific than just saying "string".
// let myName: "Poo";
// myName = "NotPoo"; // Error: only "Poo" is allowed

// You can combine literals with union "|" to allow a fixed set of values.
// This is useful for things like roles, directions, or status codes.
// let userName: "Poo" | "Poo2" | "Poo3";
// userName = "Poo2"; // valid
// userName = "Poo4"; // Error: not in the allowed set

// ============================================================
// FUNCTIONS
// ============================================================

// TypeScript lets you annotate parameter types AND return types.
// Format: (param: type): returnType => { ... }

// Arrow function with typed params and explicit return type
// const add = (a: number, b: number): number => {
//   return a + b;
// };

// "void" means the function returns nothing (no return value)
// const logMsg = (message: any): void => {
//   console.log(message);
// };

// logMsg("Hello!");
// logMsg(add(2, 3));

// Traditional function expression — same typing rules apply
// let subtract = function (c: number, d: number): number {
//   return c - d;
// };

// ============================================================
// FUNCTION TYPE ALIASES
// ============================================================

// You can describe a function's signature as a type alias.
// This makes it reusable and lets you type variables that hold functions.

// type mathFunction = (a: number, b: number) => number;

// You can also describe function signatures inside an interface:
// interface mathFunction2 {
//   (a: number, b: number): number;
// }

// When you assign a function to a typed variable, TypeScript
// infers the parameter types from the alias — no need to repeat them.
// let multiply: mathFunction = function (c, d) {
//   return c * d;  // c and d are inferred as number
// };

// ============================================================
// OPTIONAL PARAMETERS
// ============================================================

// Appending "?" to a param name makes it optional (can be undefined).
// TypeScript will NOT allow you to use it without checking first —
// that check is called a "type guard".

// const addAll = (a: number, b: number, c?: number): number => {
//   if (typeof c !== "undefined") return a + b + c; // type guard: narrows c from "number | undefined" to "number"
//   return a + b;
// };

// ============================================================
// REST PARAMETERS
// ============================================================

// "...nums" collects any number of arguments into an array.
// The type annotation goes on the array element type: number[]

// const total = (...nums: number[]): number => {
//   return nums.reduce((prev, curr) => prev + curr);
// };

// ============================================================
// THE "never" TYPE
// ============================================================

// "never" means a function NEVER returns — it either throws or loops forever.
// It's stricter than "void" (which just means no return value).

// const createError = (errMsg: string): never => {
//   throw new Error(errMsg);
// };

// "never" is also useful for exhaustiveness checks in union handling.
// If a branch is truly unreachable, TypeScript lets you use a "never"
// return to prove it at compile time.

// const numberOrString = (value: number | string): string => {
//   if (typeof value === "string") return "string";
//   if (typeof value === "number") return "number";
//   return createError("This should never happen!"); // TypeScript knows this is unreachable
// };

// ============================================================
// INFINITE LOOP — also returns "never"
// ============================================================

// A function that loops forever also has return type "never"
// because it never actually returns.

// const infinite = () => {
//   let i: number = 1;
//   while (true) {
//     i++;
//   }
// };

// ============================================================
// TYPE ASSERTIONS
// ============================================================

// Type assertions tell TypeScript "trust me, I know the type of this value."
// They do NOT change the runtime value — they only affect the type checker.
// Use them when YOU know more about a value than TypeScript can infer.

// Here we define three type aliases at different levels of specificity:
// type One = string;               // most specific: just a string
// type Two = string | number;      // less specific: string OR number
// type Three = "hello";            // most specific: only the literal "hello"

// "as" syntax for type assertion — two directions:
// let a: One = "hello";
// let b = a as Two;    // widening: "hello" treated as string | number (less specific)
// let c = a as Three;  // narrowing: "hello" treated as the literal "hello" (more specific)

// Angle-bracket syntax — does the same thing as "as", but...
// let d = <One>"World";
// let e = <string | number>"World";
// WARNING: angle-bracket assertions CANNOT be used in .tsx files (React JSX)
// because <Type> looks like a JSX element. Always prefer "as" in those files.


// ============================================================
// TYPE ASSERTION PITFALL — "lying" to TypeScript
// ============================================================

// This function returns number | string depending on the "c" argument.
// const addOrConcat = (
//   a: number,
//   b: number,
//   c: "add" | "concat",   // literal union — only these two strings are valid
// ): number | string => {
//   if (c === "add") return a + b;
//   return "" + a + b;      // concatenation returns a string like "22"
// };

// This is fine — we know "concat" returns a string, so asserting "as string" is correct.
// let myVal: string = addOrConcat(2, 2, "concat") as string;

// This compiles fine BUT is WRONG at runtime — "concat" actually returns "22" (a string),
// not a number. TypeScript trusts your assertion and won't catch this mistake.
// Type assertions bypass the type checker — use them carefully.
// let nextVal: number = addOrConcat(2, 2, "concat") as number;


// ============================================================
// DOM TYPING & NON-NULL ASSERTION
// ============================================================

// TypeScript doesn't know what the DOM contains, so querySelector returns
// Element | null by default. We use "as" to tell it the specific element type.
// const img = document.querySelector("img") as HTMLImageElement;
// Now TypeScript knows "img" has .src, .alt, etc. — properties specific to <img>.

// "!" is the non-null assertion operator.
// It tells TypeScript: "this will NOT be null or undefined — I promise."
// const myImg = document.getElementById("#img")!;
// Without "!", the type would be HTMLElement | null. With "!", it's just HTMLElement.
// If you're wrong and it IS null at runtime, you'll get a runtime error.

// Angle-bracket assertion on a DOM query — same as "as HTMLImageElement"
// const nextImg = <HTMLImageElement>document.getElementById("#img");

