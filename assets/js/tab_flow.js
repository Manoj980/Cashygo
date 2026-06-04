const tabModels = {
  "Apple iPad Series": {
    brand: "Apple Tablet",
    image: "assets/images/home-page-img/brand-img/iPad.webp",
    base: 28000
  },
  "Samsung Galaxy Tab Series": {
    brand: "Samsung Tablet",
    image: "assets/images/Brand_img/sumsung.avif",
    base: 22000
  },
  "OnePlus Pad Series": {
    brand: "OnePlus Tablet",
    image: "assets/images/Brand_img/oneplus.avif",
    base: 24000
  },
  "Xiaomi Pad Series": {
    brand: "Xiaomi Tablet",
    image: "assets/images/Brand_img/Mi.avif",
    base: 18000
  },
  "Realme Pad Series": {
    brand: "Realme Tablet",
    image: "assets/images/Brand_img/Realme.avif",
    base: 14000
  },
  "Lenovo Tab Series": {
    brand: "Lenovo Tablet",
    image: "assets/images/Brand_img/Lenavo.avif",
    base: 15000
  }
};

const tabPage = document.body.dataset.page;
const tabParams = new URLSearchParams(window.location.search);
const fallbackTabModel = tabParams.get("model") || "Apple iPad Series";

function getTabSelection() {
  const stored = sessionStorage.getItem("cashygoTabSelection");
  if (stored) return JSON.parse(stored);

  const modelData = tabModels[fallbackTabModel] || tabModels["Apple iPad Series"];
  return {
    model: fallbackTabModel,
    brand: modelData.brand,
    image: modelData.image,
    basePrice: modelData.base
  };
}

function saveTabSelection(next) {
  const current = getTabSelection();
  const merged = { ...current, ...next };
  sessionStorage.setItem("cashygoTabSelection", JSON.stringify(merged));
  renderTabSelection(merged);
  return merged;
}

function tabPrice(value) {
  return "₹" + Math.max(0, value || 0).toLocaleString("en-IN");
}

function calculateTabPrice(selection) {
  let price = selection.basePrice || 0;
  if (selection.display === "11 inch") price += 2500;
  if (selection.display === "12 inch+") price += 5500;
  if (selection.storage === "128 GB") price += 2500;
  if (selection.storage === "256 GB+") price += 6000;
  if (selection.connectivity === "WiFi + Cellular") price += 4500;
  if (selection.age === "Under 1 year") price += 3500;
  if (selection.age === "3 years+") price -= 2500;
  if (selection.condition === "Excellent") price += 1800;
  if (selection.condition === "Average") price -= 1800;
  if (selection.condition === "Damaged") price -= 6500;
  if (selection.battery === "Weak backup") price -= 2000;
  if (selection.battery === "Needs replacement") price -= 4500;
  if (selection.accessories === "Original charger missing") price -= 1200;
  if (selection.accessories === "No charger or box") price -= 2200;
  if (Array.isArray(selection.issues)) price -= selection.issues.length * 1500;
  return Math.round(price / 100) * 100;
}

function renderTabSelection(selection = getTabSelection()) {
  document.querySelectorAll("[data-model-name]").forEach(el => {
    el.textContent = selection.model || "Tablet";
  });
  document.querySelectorAll("[data-brand-name]").forEach(el => {
    el.textContent = selection.brand || "Tablet";
  });
  document.querySelectorAll("[data-tab-image]").forEach(img => {
    img.src = selection.image || tabModels["Apple iPad Series"].image;
    img.alt = selection.model || "Tablet";
  });
  document.querySelectorAll("[data-summary]").forEach(el => {
    const value = selection[el.dataset.summary];
    el.textContent = Array.isArray(value) ? (value.length ? value.join(", ") : "None selected") : (value || "-");
  });
  document.querySelectorAll("[data-summary-price]").forEach(el => {
    el.textContent = tabPrice(calculateTabPrice(selection));
  });
}

function setupTabOptions(groupName) {
  document.querySelectorAll(`[data-group="${groupName}"]`).forEach(option => {
    option.addEventListener("click", () => {
      document.querySelectorAll(`[data-group="${groupName}"]`).forEach(item => item.classList.remove("is-selected"));
      option.classList.add("is-selected");
      saveTabSelection({ [groupName]: option.dataset.value });
    });
  });
}

function enableTabButtonWhen(groups, button) {
  const check = () => {
    const selection = getTabSelection();
    button.disabled = groups.some(group => !selection[group]);
  };
  document.addEventListener("click", check);
  check();
}

renderTabSelection();

if (tabPage === "tab-variant") {
  const modelData = tabModels[fallbackTabModel] || tabModels["Apple iPad Series"];
  saveTabSelection({
    model: fallbackTabModel,
    brand: modelData.brand,
    image: modelData.image,
    basePrice: modelData.base
  });
  ["display", "storage", "connectivity", "age"].forEach(setupTabOptions);
  const next = document.getElementById("continueBtn");
  enableTabButtonWhen(["display", "storage", "connectivity", "age"], next);
  next.addEventListener("click", () => {
    window.location.href = "tab_Device_condation.html";
  });
}

if (tabPage === "tab-condition") {
  ["condition", "battery", "accessories"].forEach(setupTabOptions);
  const next = document.getElementById("continueBtn");
  enableTabButtonWhen(["condition", "battery", "accessories"], next);
  next.addEventListener("click", () => {
    window.location.href = "tab_device_question.html";
  });
}

if (tabPage === "tab-question") {
  ["bill", "lock", "data"].forEach(setupTabOptions);
  const next = document.getElementById("continueBtn");
  enableTabButtonWhen(["bill", "lock", "data"], next);
  next.addEventListener("click", () => {
    window.location.href = "tab_device_issu.html";
  });
}

if (tabPage === "tab-issue") {
  const selectedIssues = new Set(getTabSelection().issues || []);
  document.querySelectorAll("[data-issue]").forEach(card => {
    if (selectedIssues.has(card.dataset.issue)) card.classList.add("is-selected");
    card.addEventListener("click", () => {
      card.classList.toggle("is-selected");
      if (card.classList.contains("is-selected")) {
        selectedIssues.add(card.dataset.issue);
      } else {
        selectedIssues.delete(card.dataset.issue);
      }
      saveTabSelection({ issues: Array.from(selectedIssues) });
    });
  });
  document.getElementById("finishBtn").addEventListener("click", () => {
    document.getElementById("finishMsg").classList.add("is-visible");
  });
}
