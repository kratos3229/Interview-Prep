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
    e.preventDefault();

    const afterElement = getDragAfterElement(container, e.clientY);

    const dragging = document.querySelector(".dragging");

    if (afterElement === null) {
      container.appendChild(dragging);
    } else {
      container.insertBefore(dragging, afterElement);
    }
  });
});

function getDragAfterElement(container, mouseY) {
  const draggableElements = [
    ...container.querySelectorAll(".draggable:not(.dragging)"),
  ];

  let closestElement = null;
  let closestOffset = Number.NEGATIVE_INFINITY;

  for (const element of draggableElements) {
    const elementBox = element.getBoundingClientRect();

    const offset = mouseY - elementBox.top - elementBox.height / 2;

    if (offset < 0 && offset > closestOffset) {
      closestOffset = offset;
      closestElement = element;
    }
  }

  return closestElement;
}
