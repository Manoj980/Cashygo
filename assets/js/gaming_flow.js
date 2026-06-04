const gamingModels = {
  "PlayStation 5 Series": {
    brand: "Sony Gaming Console",
    image: "assets/images/home-page-img/brand-img/game.webp",
    base: 36000
  },
  "PlayStation 4 Series": {
    brand: "Sony Gaming Console",
    image: "assets/images/home-page-img/brand-img/game.webp",
    base: 18000
  },
  "Xbox Series X/S": {
    brand: "Microsoft Gaming Console",
    image: "assets/images/home-page-img/brand-img/game.webp",
    base: 34000
  },
  "Xbox One Series": {
    brand: "Microsoft Gaming Console",
    image: "assets/images/home-page-img/brand-img/game.webp",
    base: 16000
  },
  "Nintendo Switch Series": {
    brand: "Nintendo Gaming Console",
    image: "assets/images/home-page-img/brand-img/game.webp",
    base: 22000
  },
  "Other Gaming Console": {
    brand: "Gaming Console",
    image: "assets/images/home-page-img/brand-img/game.webp",
    base: 12000
  }
};

const gamingPage = document.body.dataset.page;
const gamingParams = new URLSearchParams(window.location.search);
const fallbackGamingModel = gamingParams.get("model") || "PlayStation 5 Series";

function getGamingSelection() {
  const stored = sessionStorage.getItem("cashygoGamingSelection");
  if (stored) return JSON.parse(stored);

  const modelData = gamingModels[fallbackGamingModel] || gamingModels["PlayStation 5 Series"];
  return {
    model: fallbackGamingModel,
    brand: modelData.brand,
    image: modelData.image,
    basePrice: modelData.base
  };
}

function saveGamingSelection(next) {
  const current = getGamingSelection();
  const merged = { ...current, ...next };
  sessionStorage.setItem("cashygoGamingSelection", JSON.stringify(merged));
  renderGamingSelection(merged);
  return merged;
}

function gamingPrice(value) {
  return "₹" + Math.max(0, value || 0).toLocaleString("en-IN");
}

function calculateGamingPrice(selection) {
  let price = selection.basePrice || 0;
  if (selection.console === "Disc edition") price += 3000;
  if (selection.console === "Digital edition") price += 1200;
  if (selection.storage === "1 TB+") price += 3500;
  if (selection.controllers === "2 controllers") price += 2500;
  if (selection.controllers === "No controller") price -= 3500;
  if (selection.age === "Under 1 year") price += 3000;
  if (selection.age === "3 years+") price -= 2500;
  if (selection.condition === "Excellent") price += 1800;
  if (selection.condition === "Average") price -= 1800;
  if (selection.condition === "Damaged") price -= 6500;
  if (selection.power === "Power issue") price -= 5500;
  if (selection.power === "Overheating") price -= 3000;
  if (selection.accessories === "Cables missing") price -= 1200;
  if (selection.accessories === "No box or cables") price -= 2400;
  if (Array.isArray(selection.issues)) price -= selection.issues.length * 1700;
  return Math.round(price / 100) * 100;
}

function renderGamingSelection(selection = getGamingSelection()) {
  document.querySelectorAll("[data-model-name]").forEach(el => {
    el.textContent = selection.model || "Gaming Console";
  });
  document.querySelectorAll("[data-brand-name]").forEach(el => {
    el.textContent = selection.brand || "Gaming Console";
  });
  document.querySelectorAll("[data-gaming-image]").forEach(img => {
    img.src = selection.image || gamingModels["PlayStation 5 Series"].image;
    img.alt = selection.model || "Gaming Console";
  });
  document.querySelectorAll("[data-summary]").forEach(el => {
    const value = selection[el.dataset.summary];
    el.textContent = Array.isArray(value) ? (value.length ? value.join(", ") : "None selected") : (value || "-");
  });
  document.querySelectorAll("[data-summary-price]").forEach(el => {
    el.textContent = gamingPrice(calculateGamingPrice(selection));
  });
}

function setupGamingOptions(groupName) {
  document.querySelectorAll(`[data-group="${groupName}"]`).forEach(option => {
    option.addEventListener("click", () => {
      document.querySelectorAll(`[data-group="${groupName}"]`).forEach(item => item.classList.remove("is-selected"));
      option.classList.add("is-selected");
      saveGamingSelection({ [groupName]: option.dataset.value });
    });
  });
}

function enableGamingButtonWhen(groups, button) {
  const check = () => {
    const selection = getGamingSelection();
    button.disabled = groups.some(group => !selection[group]);
  };
  document.addEventListener("click", check);
  check();
}

renderGamingSelection();

if (gamingPage === "gaming-variant") {
  const modelData = gamingModels[fallbackGamingModel] || gamingModels["PlayStation 5 Series"];
  saveGamingSelection({
    model: fallbackGamingModel,
    brand: modelData.brand,
    image: modelData.image,
    basePrice: modelData.base
  });
  ["console", "storage", "controllers", "age"].forEach(setupGamingOptions);
  const next = document.getElementById("continueBtn");
  enableGamingButtonWhen(["console", "storage", "controllers", "age"], next);
  next.addEventListener("click", () => {
    window.location.href = "Gaming_Device_condation.html";
  });
}

if (gamingPage === "gaming-condition") {
  ["condition", "power", "accessories"].forEach(setupGamingOptions);
  const next = document.getElementById("continueBtn");
  enableGamingButtonWhen(["condition", "power", "accessories"], next);
  next.addEventListener("click", () => {
    window.location.href = "Gaming_device_question.html";
  });
}

if (gamingPage === "gaming-question") {
  ["bill", "account", "reset"].forEach(setupGamingOptions);
  const next = document.getElementById("continueBtn");
  enableGamingButtonWhen(["bill", "account", "reset"], next);
  next.addEventListener("click", () => {
    window.location.href = "Gaming_device_issu.html";
  });
}

if (gamingPage === "gaming-issue") {
  const selectedIssues = new Set(getGamingSelection().issues || []);
  document.querySelectorAll("[data-issue]").forEach(card => {
    if (selectedIssues.has(card.dataset.issue)) card.classList.add("is-selected");
    card.addEventListener("click", () => {
      card.classList.toggle("is-selected");
      if (card.classList.contains("is-selected")) {
        selectedIssues.add(card.dataset.issue);
      } else {
        selectedIssues.delete(card.dataset.issue);
      }
      saveGamingSelection({ issues: Array.from(selectedIssues) });
    });
  });
  document.getElementById("finishBtn").addEventListener("click", () => {
    document.getElementById("finishMsg").classList.add("is-visible");
  });
}
