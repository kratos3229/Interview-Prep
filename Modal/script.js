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
