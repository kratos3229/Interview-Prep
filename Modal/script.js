// ===== MODAL =====
// Pseudocode:
//   1. openModal: show the modal overlay
//   2. closeModal: hide the modal overlay
//   3. Close on backdrop click: if the click target is the overlay itself
//      (not the modal content inside it), close it
//
// Note: event.target === modal works because the overlay div IS the modal element.
// Clicks on child content bubble up but event.target remains the child, not the overlay.

const modal = document.querySelector("#modal");

function closeModal() {
  modal.style.display = "none";
}

function openModal() {
  modal.style.display = "block";
}

window.onclick = function (event) {
  if (event.target === modal) {
    closeModal();
  }
};
