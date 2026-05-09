function onTabClick(event) {
  const clickedTabEl = event.target.closest("li");

  if (!clickedTabEl) return;

  document.querySelectorAll(".active").forEach((el) => {
    el.classList.remove("active");
  });

  clickedTabEl.classList.add("active");

  const id = event.target.getAttribute("href").slice(1);

  document.getElementById(id).classList.add("active");
}

const element = document.getElementById("nav-tab");

element.addEventListener("click", onTabClick);
