// FACTORY functions

// A function that creates and returns an object

function personFactory(name) {
  return {
    name,
    talk() {
      return `Hello I am ${name}`;
    },
  };
}

const me = personFactory("Poo");
me.talk(); // Hello I am Poo
// Name will be a private variable because of closure

const you = personFactory("You"); // Can be reused
you.talk(); // Hello I am You

function createElement(type, text, color) {
  const el = document.createElement(type);
  el.innerText = text;
  el.style.color = color;
  document.body.append(el);
  return {
    el,
    setText(text) {
      el.innerText = text;
    },
    setColor(color) {
      el.style.color = color;
    },
  };
}

const h1 = createElement("h1", "Hey guys", "red");
h1.setText("Good bye");
h1.setColor("blue");
