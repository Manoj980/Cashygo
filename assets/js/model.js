/* ── MODEL DATA ── */
const pageParams = new URLSearchParams(window.location.search);
const selectedBrand = pageParams.get("brand") || localStorage.getItem("selectedBrand") || "Apple";
const selectedLocation = pageParams.get("location") || localStorage.getItem("userLocation") || "";
const isLaptopModelPage = window.location.pathname.toLowerCase().includes("laptop_model");
const deviceLabel = isLaptopModelPage ? "Laptop" : "Phone";

if (!isLaptopModelPage) {
  document.querySelectorAll(
    ".cashygo-model-page__crumb-current, .cashygo-model-page__hero-label"
  ).forEach(el => {
    el.textContent = selectedBrand;
  });
}

const modelTitle = document.querySelector(".cashygo-model-page__hero h1");
if (modelTitle && !isLaptopModelPage) {
  modelTitle.textContent = "Sell Old " + selectedBrand + " " + deviceLabel + " Online for Instant Cash";
}

const modelsTitle = document.querySelector(".cashygo-models__title");
if (modelsTitle && !isLaptopModelPage) {
  modelsTitle.textContent = "Sell Your Old " + selectedBrand + " " + deviceLabel;
}

const modelsTag = document.querySelector(".cashygo-models__tag");
if (modelsTag && !isLaptopModelPage) {
  modelsTag.childNodes.forEach(node => {
    if (node.nodeType === Node.TEXT_NODE) node.textContent = selectedBrand + " Trade-In";
  });
}

const modelsSub = document.querySelector(".cashygo-models__sub");
if (modelsSub && !isLaptopModelPage) {
  modelsSub.textContent = "Choose your " + selectedBrand + " model and get instant resale value";
}

const modelSearch = document.getElementById("modelSearch");
if (modelSearch) {
  modelSearch.placeholder = isLaptopModelPage ? "Search laptop series..." : "Search " + selectedBrand + " model...";
}

if (selectedLocation) {
  const cityLabel = document.getElementById("cityLabel");
  if (cityLabel) cityLabel.textContent = selectedLocation;
}

const filterBtns = document.querySelectorAll('.cashygo-filter-btn');
const allCards = document.querySelectorAll('.cashygo-phone-card');

  function filterCards(seriesValue) {
    allCards.forEach(card => {
      const cardSeries = card.getAttribute('data-series');

      if (seriesValue === 'all' || cardSeries === seriesValue) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', function () {

      document
        .querySelector('.cashygo-active')
        .classList.remove('cashygo-active');

      this.classList.add('cashygo-active');

      filterCards(this.dataset.filter);
    });
  });
/* SEARCH */
if (modelSearch) {
  modelSearch.addEventListener('input', e => {
    const searchValue = e.target.value.trim().toLowerCase();

    allCards.forEach(card => {
      const modelName = card.textContent.toLowerCase();
      card.style.display = modelName.includes(searchValue) ? 'block' : 'none';
    });
  });
}

/* FAQ ACCORDION */
document.querySelectorAll('.cashygo-model-page__faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
        const item = btn.parentElement;
        const isOpen = item.classList.contains('cashygo-open');
        document.querySelectorAll('.cashygo-model-page__faq-item').forEach(i => i.classList.remove('cashygo-open'));
        if (!isOpen) item.classList.add('cashygo-open');
    });
});


function makeCard(m) {
    return `<div class="cashygo-model-page__card" 
        data-series="${m.series}" 
        onclick="window.location.href='otp.html?model=${encodeURIComponent(m.name)}&price=${encodeURIComponent(m.price)}'">
        <div class="cashygo-model-page__card-img"><div class="cashygo-model-page__phone-icon"></div></div>
        <div class="cashygo-model-page__card-name">${m.name}</div>
        <div class="cashygo-model-page__card-price">Up to ${m.price}</div>
    </div>`;
}
