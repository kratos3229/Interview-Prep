// ============================================================
// TYPE ALIASES
// ============================================================
export {};
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
// ============================================================
// CLASSES
// ============================================================
//
// TypeScript classes extend JS classes with access modifiers and type safety.
//
// ACCESS MODIFIERS — control where a property can be read or written:
//   public    → accessible anywhere (default if omitted)
//   private   → only accessible inside THIS class
//   protected → accessible inside this class AND subclasses, not outside
//   readonly  → can be set once (in constructor), never reassigned after
//
// PARAMETER PROPERTIES — a TypeScript shorthand:
//   Declaring a param with an access modifier in the constructor
//   automatically creates AND assigns the property. No need to write
//   `this.name = name` manually for those params.
//
// "!" is the definite assignment assertion — tells TypeScript
// "I know this looks uninitialized, but I guarantee it will be set
// before it's used." Without it, TS would error on `secondLang` since
// it's never set in the constructor.
// class Coder {
//   secondLang!: string;  // definite assignment assertion — set later, not in constructor
//
//   constructor(
//     public readonly name: string,   // parameter property: creates this.name, can't be reassigned
//     public music: string,            // parameter property: creates this.music
//     private age: number,             // parameter property: creates this.age, only accessible inside Coder
//     protected lang: string = "Typescript", // parameter property with default value
//   ) {
//     // These assignments are redundant when using parameter properties,
//     // but harmless. TypeScript already handles them via the modifiers above.
//     this.name = name;
//     this.music = music;
//     this.age = age;
//     this.lang = lang;
//   }
//
//   public getAge() {
//     return `Hello, I'm ${this.age}`; // fine — age is accessible inside the class
//   }
// }
// const Poo = new Coder("Poo", "Rock", 42);
// console.log(Poo.getAge());  // works — getAge() is public
// console.log(Poo.age);       // ERROR — age is private, can't access outside the class
// ============================================================
// INHERITANCE — extends
// ============================================================
//
// "extends" creates a subclass that inherits all public and protected
// members from the parent. Private members are inherited but NOT accessible.
//
// "super(...)" MUST be called first in the child constructor before
// touching `this` — it runs the parent's constructor to initialize
// the inherited properties.
//
// Notice: `name`, `music`, `age` are NOT given access modifiers in WebDev's
// constructor — that means they are just constructor arguments being
// forwarded to super(), NOT new properties on WebDev.
// class WebDev extends Coder {
//   constructor(
//     public computer: string, // new property unique to WebDev
//     name: string,            // forwarded to super() — not a new property
//     music: string,
//     age: number,
//   ) {
//     super(name, music, age); // must come before any `this` usage
//     this.computer = computer;
//   }
//
//   public getLang() {
//     return `I write ${this.lang}`; // `lang` is protected in Coder — accessible here in the subclass
//   }
// }
// const Sara = new WebDev("Mac", "Sara", "Lofi", 25);
// ============================================================
// CLASSES IMPLEMENTING INTERFACES
// ============================================================
//
// An interface defines a CONTRACT — a shape that a class must fulfill.
// "implements" tells TypeScript: "this class promises to have everything
// the interface requires." If it's missing a property or method, TS errors.
//
// Key distinction:
//   - "extends" → inherits behavior (code) from a parent class
//   - "implements" → promises to match a shape (no code inherited)
//
// A class can implement multiple interfaces at once:
//   class Foo implements InterfaceA, InterfaceB { ... }
// interface Musician {
//   name: string;
//   instrument: string;
//   play(action: string): string; // method signature — class must implement this
// }
// class Guitarist implements Musician {
//   name: string;
//   instrument: string;
//
//   constructor(name: string, instrument: string) {
//     this.name = name;
//     this.instrument = instrument;
//   }
//
//   play(action: string): string {
//     return `${this.name} ${action} the ${this.instrument}`;
//   }
// }
// const Page = new Guitarist("Jimmy", "guitar");
// console.log(Page.play("strum")); // "Jimmy strum the guitar"
// ============================================================
// STATIC MEMBERS
// ============================================================
//
// Static properties and methods belong to the CLASS itself, not to any
// individual instance. They are shared across all instances.
//
// Access them via the class name: Peeps.count — NOT via `this` or an instance.
//
// Common use cases:
//   - Counters (how many instances have been created)
//   - Factory methods (alternative constructors)
//   - Utility/helper methods that don't need instance data
// class Peeps {
//   static count: number = 0; // shared across ALL instances — lives on the class
//
//   static getCount(): number {
//     return Peeps.count;       // accessed via class name, not `this`
//   }
//
//   public id: number;
//
//   constructor(public name: string) {
//     this.name = name;
//     this.id = ++Peeps.count; // increments the shared counter and assigns unique id
//   }
// }
// const John  = new Peeps("John");  // Peeps.count = 1, John.id  = 1
// const Steve = new Peeps("Steve"); // Peeps.count = 2, Steve.id = 2
// const Amy   = new Peeps("Amy");   // Peeps.count = 3, Amy.id   = 3
// ============================================================
// GETTERS AND SETTERS
// ============================================================
//
// Getters and setters let you expose a property with controlled read/write access.
// From the outside they look like plain properties, but they run functions.
//
//   get data()         → called when you READ  bands.data
//   set data(value)    → called when you WRITE bands.data = [...]
//
// Why use them over a plain public property?
//   - Validation on write (reject bad data before storing it)
//   - Computed values on read (transform data before returning)
//   - Expose a public surface while keeping the actual storage private
//
// The pattern here: `dataState` is the private backing field.
// `data` is the public-facing getter/setter pair that wraps it.
// class Bands {
//   private dataState: string[]; // the real storage — hidden from outside
//
//   constructor() {
//     this.dataState = [];
//   }
//
//   public get data(): string[] {
//     return this.dataState; // read the private field
//   }
//
//   public set data(value: string[]) {
//     // validation: only accept an array where every element is a string
//     if (Array.isArray(value) && value.every((el) => typeof el === "string")) {
//       this.dataState = value;
//       return;
//     } else throw new Error("Param is not an array of strings");
//   }
// }
// const myBands = new Bands();
// myBands.data = ["Alice in Chains", "Nirvana"]; // calls the setter — validation runs
// console.log(myBands.data);                      // calls the getter — ["Alice in Chains", "Nirvana"]
// myBands.data = [1, 2, 3];                       // throws Error — not an array of strings
// ============================================================
// INDEX SIGNATURES
// ============================================================
//
// An index signature tells TypeScript: "this object can have any number
// of keys of a given type, and all their values will be this type."
//
// Syntax: [index: string]: ValueType
//   - The name `index` is just a label — it can be anything
//   - The key type must be `string`, `number`, or `symbol`
//   - The value type applies to ALL keys, including any explicitly named ones
//
// IMPORTANT CONSTRAINT: if you combine an index signature with named
// properties, the named property types must be ASSIGNABLE to the index
// signature's value type.
// e.g. [index: string]: number means Pizza, Books, Job must ALL be number — they are.
// If you tried to add `name: string` alongside `[index: string]: number`, TS would error.
// interface TransactionObj {
//   [index: string]: number; // any string key → number value
//   Pizza: number;           // explicitly named keys are also valid — they satisfy the index signature
//   Books: number;
//   Job: number;
// }
// const todaysTransactions: TransactionObj = {
//   Pizza: -10,
//   Books: -5,
//   Job: 50,
// };
// Because of the index signature, you can also access with a dynamic string key:
// todaysTransactions["Pizza"]     // -10  (fine — known key)
// todaysTransactions["anything"]  // valid per the type (returns number), but undefined at runtime
// ============================================================
// keyof — iterating over typed object keys
// ============================================================
//
// When you loop over an object's keys with `for...in` or `Object.keys()`,
// TypeScript gives you `string` — it doesn't know which specific keys exist.
// That means `student[key]` would error because `string` isn't a valid index
// into a specific interface.
//
// Fix: cast the key using `keyof`:
//   key as keyof Student          → "name" | "gpa" | "classes"
//   key as keyof typeof student   → same thing, derived from the value instead of the type
//
// The commented-out index signature on Student was an alternative approach:
// adding `[index: string]: ...` makes TypeScript accept any string key,
// but you lose the safety of knowing exactly which keys exist.
// `keyof` is almost always the better solution.
// interface Student {
//   // [index: string]: string | number | number[] | undefined; // alternative — less safe
//   name: string;
//   gpa: number;
//   classes?: number[]; // optional property
// }
// const student: Student = {
//   name: "Doug",
//   gpa: 3.5,
//   classes: [100, 200],
// };
// console.log(student.test); // ERROR — "test" doesn't exist on Student
//                             // (would be fine if index signature were uncommented)
// for (const key in student) {
//   // `key` is typed as `string` here — too broad to index into Student directly
//   // `keyof Student` narrows it to "name" | "gpa" | "classes" so TS allows the lookup
//   console.log(`${key}: ${student[key as keyof Student]}`);
// }
// Object.keys() also returns string[] — same problem, same fix
// Object.keys(student).map((key) => {
//   // `keyof typeof student` derives the key union from the variable itself
//   // equivalent to `keyof Student` here, but useful when you don't have the interface name handy
//   console.log(student[key as keyof typeof student]);
// });
//# sourceMappingURL=main.js.map