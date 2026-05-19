// ===================== SET =====================
// A Set is a collection of UNIQUE values (no duplicates allowed).
// Can store any type: primitives, objects, etc.
// Maintains insertion order.
// Use cases: removing duplicates from arrays, tracking unique items, fast lookup with .has()

let myArray = [11, 22, 34, 65, 34];
let mySet = new Set(myArray);

console.log(mySet); // Set {11, 22, 34, 65} — duplicate 34 is removed automatically

// Common Set methods:
mySet.add("100"); // Set {11, 22, 34, 65, '100'} — adds a new value
mySet.add({ a: 1, b: 2 }); // objects are compared by reference, not value
mySet.delete(22); // removes 22 from the set, returns true if found
mySet.clear(); // removes ALL elements from the set
mySet.add(50); // Set {50}

console.log(mySet.size); // 1 — .size is a property, not a method (no parentheses)

// Iterating over a Set — values appear in insertion order
mySet.forEach((value) => {
  console.log(val);
});

// Set vs Array:
// - Set has O(1) lookup with .has(), Array uses O(n) .includes()
// - Set automatically removes duplicates
// - Array has index-based access, Set does not

// ===================== MAP =====================
// A Map holds key-value pairs where keys can be ANY type (objects, functions, primitives).
// Unlike plain objects where keys are always strings/symbols.
// Maintains insertion order of keys.
// Use cases: caching, dictionaries with non-string keys, preserving insertion order

let myMap = new Map([
  ["a1", "Hello"],
  ["b2", "Goodbye"],
]);

console.log(myMap); // Map {"a1" => "Hello", "b2" => "Goodbye"}

// Common Map methods:
myMap.set("c3", "Foo"); // adds or updates a key-value pair
myMap.delete("a1"); // removes entry by key, returns true if found
myMap.size; // returns number of entries (property, not method)

// Map vs Object:
// - Map keys can be any type; Object keys are strings/symbols
// - Map has .size property; Object needs Object.keys(obj).length
// - Map is iterable directly; Object needs Object.entries()
// - Map performs better for frequent additions/deletions

// ===================== WEAKSET =====================
// A WeakSet is like a Set but:
// - Can ONLY store objects (no primitives)
// - Holds "weak" references — if no other reference to an object exists, it gets garbage collected
// - NOT iterable (no forEach, no size property)
// - Use cases: tracking DOM nodes, marking objects as "visited" without preventing GC

let carWeakSet = new WeakSet();
let car1 = {
  make: "Honda",
  model: "Civic",
};
let car2 = {
  make: "Toyota",
  model: "Camry",
};

carWeakSet.add(car1);
carWeakSet.add(car2);

console.log(carWeakSet); // Weakset { Object {make: 'Honda', model: 'Civic'}, Object {make: 'Toyota', model: 'Camry'} }

carWeakSet.delete(car1);
// If car1 = null and no other reference exists, it will be garbage collected from the WeakSet

// ===================== WEAKMAP =====================
// A WeakMap is like a Map but:
// - Keys MUST be objects (values can be anything)
// - Keys are held weakly — if the key object has no other references, the entry is garbage collected
// - NOT iterable (no forEach, no size, no .keys()/.values())
// - Use cases: storing private data for objects, caching computed results tied to object lifetime

let carWeakMap = new WeakMap();

let key1 = {
  id: 1,
};

carWeakMap.set(key1, car1);

console.log(carWeakMap); // WeakMap { Object {id: 1} => Object {make: 'Honda', model: 'Civic'} }

carWeakMap.delete(key1);
// If key1 = null, the entry is automatically garbage collected

// ===================== SUMMARY =====================
// | Feature     | Set        | WeakSet       | Map        | WeakMap       |
// |-------------|------------|---------------|------------|---------------|
// | Stores      | Any values | Objects only  | Key-Value  | Key-Value     |
// | Keys type   | N/A        | N/A           | Any type   | Objects only  |
// | Iterable    | Yes        | No            | Yes        | No            |
// | .size       | Yes        | No            | Yes        | No            |
// | GC-friendly | No         | Yes           | No         | Yes           |
// | Use case    | Unique list| Track objects | Dictionary | Private data  |
