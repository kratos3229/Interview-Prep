// ===== TABS =====
// Pseudocode:
//   1. Attach ONE click listener on the parent nav (event delegation)
//   2. On click:
//      a. Find the clicked <li> (closest ancestor)
//      b. Remove "active" from all tabs and content panels
//      c. Add "active" to the clicked tab
//      d. Extract the href (e.g. "#tab1"), find that content panel, activate it
//
// Uses event delegation: one listener on the parent instead of one per tab.
// .closest("li") handles clicks on nested elements (e.g. <a> inside <li>).

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
