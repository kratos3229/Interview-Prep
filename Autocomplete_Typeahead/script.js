// ===== AUTOCOMPLETE / TYPEAHEAD =====
// Pseudocode:
//   1. On keyup:
//      - Arrow keys: move focus index up/down, highlight the focused suggestion
//      - Enter: select the focused suggestion (fill input, clear list)
//      - Escape: clear suggestions
//      - Any other key: debounce an API fetch for matching products
//   2. On click (suggestion item): select that suggestion
//   3. Debounce prevents firing API calls on every keystroke — only fires
//      after user pauses for 300ms

// DOM references & state
const input = document.querySelector(".searchInput");
const suggestionsContainer = document.querySelector(".suggestions");
let currentFocusedIndex = -1;

// Utilities
function debounce(callbackFunc, delay = 300) {
  let timeoutID;

  return (...args) => {
    clearTimeout(timeoutID);
    timeoutID = setTimeout(callbackFunc, delay, ...args);
  };
}

// API layer
async function fetchSuggestions(searchInput) {
  try {
    const response = await fetch(
      `https://dummyjson.com/products/search?q=${searchInput}`,
    );
    const data = await response.json();
    const titles = data.products.map((item) => item.title);
    renderSuggestions(titles);
  } catch (error) {
    console.log(error);
  }
}

const debouncedFetchSuggestions = debounce(fetchSuggestions);

// DOM rendering
function createSuggestionElement(title) {
  const element = document.createElement("div");
  element.classList.add("searchItem");
  element.innerText = title;
  return element;
}

function clearSuggestions() {
  suggestionsContainer.innerHTML = "";
}

function renderSuggestions(titles) {
  clearSuggestions();
  titles.forEach((title) => {
    const element = createSuggestionElement(title);
    element.addEventListener("click", () => selectSuggestion(title));
    suggestionsContainer.appendChild(element);
  });
}

// Selection logic
function selectSuggestion(text) {
  input.value = text;
  clearSuggestions();
  currentFocusedIndex = -1;
}

// Keyboard navigation
function getNextFocusIndex(key, maxIndex) {
  if (key === "ArrowDown") {
    return Math.min(currentFocusedIndex + 1, maxIndex - 1);
  } else if (key === "ArrowUp") {
    return Math.max(currentFocusedIndex - 1, -1);
  }
}

function highlightFocusedItem() {
  for (let i = 0; i < suggestionsContainer.children.length; i++) {
    suggestionsContainer.children[i].classList.remove("highlighted");
  }

  if (
    currentFocusedIndex >= 0 &&
    currentFocusedIndex < suggestionsContainer.children.length
  )
    suggestionsContainer.children[currentFocusedIndex].classList.add(
      "highlighted",
    );
}

// Main handler
function handleKeyup(event) {
  const key = event.key;
  if (key === "ArrowDown" || key === "ArrowUp") {
    event.preventDefault();
    currentFocusedIndex = getNextFocusIndex(
      key,
      suggestionsContainer.children.length,
    );
    highlightFocusedItem();
  } else if (key === "Enter") {
    if (
      currentFocusedIndex >= 0 &&
      suggestionsContainer.children[currentFocusedIndex]
    ) {
      selectSuggestion(
        suggestionsContainer.children[currentFocusedIndex].innerText,
      );
    }
  } else if (key === "Escape") {
    clearSuggestions();
  } else {
    debouncedFetchSuggestions(event.target.value);
  }
}

// Event registration
input.addEventListener("keyup", handleKeyup);
