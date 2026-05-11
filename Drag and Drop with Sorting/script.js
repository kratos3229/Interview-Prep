// ===== DRAG AND DROP WITH SORTING =====
// Pseudocode:
//   1. On dragstart: mark the dragged element
//   2. On dragover (container): prevent default to allow drop,
//      find the element the mouse is closest ABOVE, insert dragged element before it
//   3. On dragend: unmark the dragged element
//
// Key insight: getDragAfterElement determines WHERE to insert by comparing
// the mouse Y to each element's vertical midpoint. The element with the
// smallest negative offset (mouse is just above its center) wins.

const draggables = document.querySelectorAll(".draggable");
const containers = document.querySelectorAll(".container");

draggables.forEach((draggable) => {
  draggable.addEventListener("dragstart", () => {
    draggable.classList.add("dragging");
  });

  draggable.addEventListener("dragend", () => {
    draggable.classList.remove("dragging");
  });
});

containers.forEach((container) => {
  container.addEventListener("dragover", (e) => {
    e.preventDefault(); // required to allow dropping

    const afterElement = getDragAfterElement(container, e.clientY);

    const dragging = document.querySelector(".dragging");

    if (afterElement === null) {
      container.appendChild(dragging); // mouse is below all elements
    } else {
      container.insertBefore(dragging, afterElement);
    }
  });
});

// Returns the element the dragged item should be placed BEFORE,
// or null if it should go at the end.
function getDragAfterElement(container, mouseY) {
  const draggableElements = [
    ...container.querySelectorAll(".draggable:not(.dragging)"),
  ];

  let closestElement = null;
  let closestOffset = Number.NEGATIVE_INFINITY;

  for (const element of draggableElements) {
    const elementBox = element.getBoundingClientRect();

    // negative offset = mouse is above this element's center
    const offset = mouseY - elementBox.top - elementBox.height / 2;

    // find the element where mouse is just barely above (closest to 0 from negative side)
    if (offset < 0 && offset > closestOffset) {
      closestOffset = offset;
      closestElement = element;
    }
  }

  return closestElement;
}
