// ===== INFINITE SCROLL IMPLEMENTATION =====
// Uses two IntersectionObservers:
//   1. One for card entrance animations (slide-in from right)
//   2. One for detecting when the user has scrolled to the bottom (triggers loading new cards)

const cards = document.querySelectorAll(".card");
const cardContainer = document.querySelector(".card-container");

// --- OBSERVER 1: Card Animation Observer ---
// Purpose: Adds "show" class to cards when they enter the viewport
// This triggers the CSS slide-in animation
//
// Pseudocode:
//   for each card that changed visibility:
//     if card is at least 50% visible -> add "show" class
//     if card is less than 50% visible -> remove "show" class
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      // toggle("show", true) adds the class, toggle("show", false) removes it
      entry.target.classList.toggle("show", entry.isIntersecting);
    });
  },
  {
    threshold: 0.5, // card must be 50% visible to trigger
    rootMargin: "-24px", // shrinks the detection zone by 24px (cards trigger slightly later)
  },
);

// --- OBSERVER 2: Infinite Scroll Observer ---
// Purpose: Watches the LAST card. When it becomes visible, load more cards.
//
// Pseudocode:
//   when last card enters viewport:
//     1. load 10 new cards
//     2. stop watching the old last card
//     3. start watching the NEW last card
//   this creates a chain: each new last card becomes the next trigger
const lastCardObserver = new IntersectionObserver(
  (entries) => {
    const lastCard = entries[0];
    if (!lastCard.isIntersecting) return; // only act when card enters viewport

    loadNewCards();
    lastCardObserver.unobserve(lastCard.target); // stop watching old last card
    lastCardObserver.observe(document.querySelector(".card:last-child")); // watch new last card
  },
  {
    rootMargin: "100px", // triggers 100px BEFORE the card is actually visible (preloads early)
  },
);

// --- Load New Cards ---
// Simulates fetching data and appending new cards to the DOM
// In a real app, this would be an async API call:
//   const data = await fetch(`/api/items?page=${page}`);
//   data.items.forEach(item => createCard(item));
function loadNewCards() {
  for (let i = 0; i < 10; i++) {
    const newCard = document.createElement("div");
    newCard.classList.add("card");
    if (i === 9) {
      newCard.textContent = "This is the new last card";
    } else {
      newCard.textContent = "New Card";
    }
    observer.observe(newCard); // register with animation observer so it slides in
    cardContainer.append(newCard);
  }
}

// --- Initialize ---
// Start watching the last card for infinite scroll trigger
lastCardObserver.observe(document.querySelector(".card:last-child"));

// Register all existing cards with the animation observer
cards.forEach((card) => {
  observer.observe(card);
});
