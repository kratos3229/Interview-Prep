//Closure

// Lexical Scope defines how variable names are resolved in nested functions.

// Nested functions have access to the scope of their parent functions

// This is often confused with closure, but lexical scope is only an important part of closure

// CLOSURE: A closure is a function having access to the parent scope, even after the parent function has closed.

// A closure is created when we define a function, not when a function is executed.

//global scope
let x = 1;

const parentFunction = () => {
  //local scope
  let myValue = 2;
  console.log(x);
  console.log(myValue);

  const childFunction = () => {
    console.log((x += 5));
    console.log((myValue += 1));
  };

  return childFunction;
};

function memoize(fn) {
  let cache = new Map();

  return (...args) => {
    if (cache.has(args)) return cache;

    return cache.set(args, fn(...args));
  };
}

const result = parentFunction();
console.log(result); // childFunction
result(); // 6 and 3. Has access to myvalue even though parent function has already executed.
result(); // 11 and 4. Also remembers myvalue.
result(); // 16 and 5.
