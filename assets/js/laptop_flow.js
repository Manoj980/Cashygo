const laptopModels = {
  "Dell Inspiron Series": {
    brand: "Dell Laptop",
    image: "assets/images/laptop_img/laptop_model_img/Dell%20Inspiron%20Series.avif",
    base: 22000
  },
  "HP 15 Series": {
    brand: "HP Laptop",
    image: "assets/images/laptop_img/laptop_model_img/HP%2015%20Series.avif",
    base: 18000
  },
  "HP Pavilion Series": {
    brand: "HP Laptop",
    image: "assets/images/laptop_img/laptop_model_img/HP%20Pavilion%20Series.avif",
    base: 21000
  },
  "Asus VivoBook Series": {
    brand: "Asus Laptop",
    image: "assets/images/laptop_img/laptop_model_img/Asus%20VivoBook%20Series.avif",
    base: 20000
  },
  "Lenovo IdeaPad Series": {
    brand: "Lenovo Laptop",
    image: "assets/images/laptop_img/sell-lenovo-laptop.webp",
    base: 19000
  },
  "Acer Aspire Series": {
    brand: "Acer Laptop",
    image: "assets/images/laptop_img/sell-acer-laptop.webp",
    base: 17000
  },
  "Apple MacBook Series": {
    brand: "Apple Laptop",
    image: "assets/images/laptop_img/sell-apple-phone.webp",
    base: 62000
  },
  "Microsoft Surface Series": {
    brand: "Microsoft Laptop",
    image: "assets/images/laptop_img/sell-microsoft-laptop.webp",
    base: 36000
  }
};

const page = document.body.dataset.page;
const params = new URLSearchParams(window.location.search);
const fallbackModel = params.get("model") || "Dell Inspiron Series";

function getSelection() {
  const stored = sessionStorage.getItem("cashygoLaptopSelection");
  if (stored) return JSON.parse(stored);

  const modelData = laptopModels[fallbackModel] || laptopModels["Dell Inspiron Series"];
  return {
    model: fallbackModel,
    brand: modelData.brand,
    image: modelData.image,
    basePrice: modelData.base
  };
}

function saveSelection(next) {
  const current = getSelection();
  const merged = { ...current, ...next };
  sessionStorage.setItem("cashygoLaptopSelection", JSON.stringify(merged));
  renderSelection(merged);
  return merged;
}

function formatPrice(value) {
  return "₹" + Math.max(0, value || 0).toLocaleString("en-IN");
}

function calculatePrice(selection) {
  let price = selection.basePrice || 0;
  if (selection.processor === "Intel i7 / Ryzen 7 / M-series") price += 7000;
  if (selection.processor === "Intel i5 / Ryzen 5") price += 3500;
  if (selection.ram === "16 GB") price += 3000;
  if (selection.ram === "32 GB+") price += 6500;
  if (selection.storage === "512 GB SSD") price += 2500;
  if (selection.storage === "1 TB SSD") price += 5500;
  if (selection.age === "Under 1 year") price += 4000;
  if (selection.age === "3 years+") price -= 3500;
  if (selection.condition === "Excellent") price += 2500;
  if (selection.condition === "Average") price -= 2500;
  if (selection.condition === "Damaged") price -= 7000;
  if (selection.battery === "Weak backup") price -= 2500;
  if (selection.battery === "Needs replacement") price -= 5500;
  if (selection.accessories === "Original charger missing") price -= 1800;
  if (selection.accessories === "No charger or box") price -= 3000;
  if (Array.isArray(selection.issues)) price -= selection.issues.length * 1800;
  return Math.round(price / 100) * 100;
}

function renderSelection(selection = getSelection()) {
  document.querySelectorAll("[data-model-name]").forEach(el => {
    el.textContent = selection.model || "Laptop";
  });
  document.querySelectorAll("[data-brand-name]").forEach(el => {
    el.textContent = selection.brand || "Laptop";
  });
  document.querySelectorAll("[data-laptop-image]").forEach(img => {
    img.src = selection.image || laptopModels["Dell Inspiron Series"].image;
    img.alt = selection.model || "Laptop";
  });
  document.querySelectorAll("[data-summary]").forEach(el => {
    const key = el.dataset.summary;
    const value = selection[key];
    el.textContent = Array.isArray(value) ? (value.length ? value.join(", ") : "None selected") : (value || "-");
  });
  document.querySelectorAll("[data-summary-price]").forEach(el => {
    el.textContent = formatPrice(calculatePrice(selection));
  });
}

function setupOptions(groupName) {
  document.querySelectorAll(`[data-group="${groupName}"]`).forEach(option => {
    option.addEventListener("click", () => {
      document.querySelectorAll(`[data-group="${groupName}"]`).forEach(item => item.classList.remove("is-selected"));
      option.classList.add("is-selected");
      saveSelection({ [groupName]: option.dataset.value });
    });
  });
}

function enableButtonWhen(groups, button) {
  const check = () => {
    const selection = getSelection();
    button.disabled = groups.some(group => !selection[group]);
  };
  document.addEventListener("click", check);
  check();
}

renderSelection();

if (page === "variant") {
  const modelData = laptopModels[fallbackModel] || laptopModels["Dell Inspiron Series"];
  saveSelection({
    model: fallbackModel,
    brand: modelData.brand,
    image: modelData.image,
    basePrice: modelData.base
  });
  ["processor", "ram", "storage", "age"].forEach(setupOptions);
  const next = document.getElementById("continueBtn");
  enableButtonWhen(["processor", "ram", "storage", "age"], next);
  next.addEventListener("click", () => {
    window.location.href = "laptop_Device_condation.html";
  });
}

if (page === "condition") {
  ["condition", "battery", "accessories"].forEach(setupOptions);
  const next = document.getElementById("continueBtn");
  enableButtonWhen(["condition", "battery", "accessories"], next);
  next.addEventListener("click", () => {
    window.location.href = "laptop_device_question.html";
  });
}

if (page === "question") {
  ["bill", "password", "data"].forEach(setupOptions);
  const next = document.getElementById("continueBtn");
  enableButtonWhen(["bill", "password", "data"], next);
  next.addEventListener("click", () => {
    window.location.href = "laptop_device_issu.html";
  });
}

if (page === "issue") {
  const selectedIssues = new Set(getSelection().issues || []);
  document.querySelectorAll("[data-issue]").forEach(card => {
    if (selectedIssues.has(card.dataset.issue)) card.classList.add("is-selected");
    card.addEventListener("click", () => {
      card.classList.toggle("is-selected");
      if (card.classList.contains("is-selected")) {
        selectedIssues.add(card.dataset.issue);
      } else {
        selectedIssues.delete(card.dataset.issue);
      }
      saveSelection({ issues: Array.from(selectedIssues) });
    });
  });
  document.getElementById("finishBtn").addEventListener("click", () => {
    document.getElementById("finishMsg").classList.add("is-visible");
  });
}
