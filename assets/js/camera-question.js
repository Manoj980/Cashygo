/**
 * Camera Question Page JavaScript
 * Handles accessories multi-select and navigation
 */

(function() {
  'use strict';

  // ── ACCESSORIES DATA ──
  const accessories = [
    { id: 'lens', label: 'Original Lens Available', hint: 'Kit lens or bundled lens included', icon: 'bi-circle-square', bonus: 2000 },
    { id: 'battery', label: 'Battery & Charger Available', hint: 'Original battery and charger', icon: 'bi-battery-charging', bonus: 800 },
    { id: 'bill', label: 'Original Bill or Box', hint: 'Improves buyer trust and value', icon: 'bi-receipt-cutoff', bonus: 500 },
    { id: 'extras', label: 'Memory Card, Strap or Bag', hint: 'Optional accessories included', icon: 'bi-bag-check', bonus: 300 }
  ];

  // ── STATE ──
  const state = {
    selected: [],
    basePrice: 0,
    selection: {}
  };

  // ── DOM ELEMENTS ──
  const accessoryGrid = document.getElementById('accessoryGrid');
  const continueBtn = document.getElementById('continueBtn');
  const priceDisplay = document.getElementById('quotePrice');
  const selectedCountDisplay = document.getElementById('selectedCount');
  const deviceName = document.getElementById('deviceName');
  const deviceMeta = document.getElementById('deviceMeta');
  const crumbModel = document.getElementById('crumbModel');

  // ── UTILITIES ──
  const rupee = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  });

  function readJSON(key, fallback) {
    try {
      return { ...fallback, ...JSON.parse(sessionStorage.getItem(key) || '{}') };
    } catch (e) {
      return fallback;
    }
  }

  // ── CALCULATE PRICE ──
  function calculatePrice() {
    let bonus = 0;
    state.selected.forEach(id => {
      const acc = accessories.find(a => a.id === id);
      if (acc) bonus += acc.bonus;
    });
    return state.basePrice + bonus;
  }

  // ── RENDER ACCESSORIES ──
  function renderAccessories() {
    if (!accessoryGrid) return;

    accessoryGrid.innerHTML = accessories.map(acc => {
      const isSelected = state.selected.includes(acc.id);
      return `
        <button class="accessory-card ${isSelected ? 'selected' : ''}"
                type="button"
                data-id="${acc.id}"
                role="checkbox"
                aria-checked="${isSelected}">
          <span class="accessory-check"><i class="bi bi-check-lg"></i></span>
          <span class="accessory-icon"><i class="bi ${acc.icon}"></i></span>
          <span class="accessory-text">
            <strong>${acc.label}</strong>
            <span>${acc.hint}</span>
          </span>
        </button>`;
    }).join('');

    // Attach click handlers
    accessoryGrid.querySelectorAll('.accessory-card').forEach(card => {
      card.addEventListener('click', () => toggleAccessory(card.dataset.id));
    });
  }

  // ── TOGGLE ACCESSORY ──
  function toggleAccessory(id) {
    const index = state.selected.indexOf(id);
    if (index > -1) {
      state.selected.splice(index, 1);
    } else {
      state.selected.push(id);
    }
    updateUI();
  }

  // ── UPDATE UI ──
  function updateUI() {
    // Update cards
    accessoryGrid.querySelectorAll('.accessory-card').forEach(card => {
      const isSelected = state.selected.includes(card.dataset.id);
      card.classList.toggle('selected', isSelected);
      card.setAttribute('aria-checked', String(isSelected));
    });

    // Update price
    if (priceDisplay) {
      priceDisplay.textContent = rupee.format(calculatePrice());
    }

    // Update selected count
    if (selectedCountDisplay) {
      selectedCountDisplay.textContent = state.selected.length;
    }

    // Update summary rows
    updateSummaryRows();

    // Enable continue button if at least one accessory selected
    if (continueBtn) {
      continueBtn.disabled = state.selected.length === 0;
    }
  }

  // ── UPDATE SUMMARY ROWS ──
  function updateSummaryRows() {
    accessories.forEach(acc => {
      const row = document.getElementById(`row-${acc.id}`);
      if (row) {
        const isSelected = state.selected.includes(acc.id);
        row.classList.toggle('done', isSelected);
        const valEl = row.querySelector('.selected-val');
        if (valEl) {
          valEl.textContent = isSelected ? '+' + rupee.format(acc.bonus) : 'Not selected';
        }
      }
    });
  }

  // ── RENDER SUMMARY ROWS ──
  function renderSummaryRows() {
    const container = document.getElementById('summaryList');
    if (!container) return;

    container.innerHTML = accessories.map(acc => `
      <div class="selected-row" id="row-${acc.id}">
        <div class="tick"><i class="bi bi-check-lg"></i></div>
        <span class="selected-label">${acc.label}</span>
        <span class="selected-val">Not selected</span>
      </div>`).join('');
  }

  // ── SAVE AND CONTINUE ──
  function saveAndContinue() {
    if (state.selected.length === 0) {
      return;
    }

    // Get selected labels
    const selectedLabels = state.selected.map(id => {
      const acc = accessories.find(a => a.id === id);
      return acc ? acc.label : '';
    }).filter(Boolean);

    // Load existing condition data
    const existingCondition = readJSON('cashygoCameraCondition', {});

    // Save accessories
    const updatedCondition = {
      ...existingCondition,
      accessories: selectedLabels.join(', ')
    };

    sessionStorage.setItem('cashygoCameraCondition', JSON.stringify(updatedCondition));

    // Update selection with final price
    const updatedSelection = {
      ...state.selection,
      price: calculatePrice()
    };
    sessionStorage.setItem('cashygoCameraSelection', JSON.stringify(updatedSelection));

    // Navigate to condition page
    window.location.href = 'camera_conation.html';
  }

  // ── INITIALIZE ──
  function init() {
    // Load selection data
    state.selection = readJSON('cashygoCameraSelection', {
      brand: 'Sony',
      model: 'Sony Alpha A7 III',
      type: 'Mirrorless Camera',
      price: 76000
    });

    state.basePrice = Number(state.selection.price) || 76000;

    // Update device info
    if (deviceName) deviceName.textContent = state.selection.model;
    if (deviceMeta) deviceMeta.textContent = `${state.selection.brand} - ${state.selection.type}`;
    if (crumbModel) crumbModel.textContent = state.selection.model;

    // Render accessories
    renderAccessories();
    renderSummaryRows();
    updateUI();

    // Continue button handler
    if (continueBtn) {
      continueBtn.addEventListener('click', saveAndContinue);
    }
  }

  // ── NAVIGATION HANDLERS ──
  const cityPicker = document.getElementById('cityPicker');
  const cityLabel = document.getElementById('cityLabel');
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('navMenu');

  if (cityPicker && cityLabel) {
    cityPicker.addEventListener('click', (e) => {
      e.stopPropagation();
      cityPicker.classList.toggle('open');
    });

    cityPicker.querySelectorAll('li').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        cityLabel.textContent = item.dataset.city;
        cityPicker.classList.remove('open');
        sessionStorage.setItem('selectedCity', item.dataset.city);
      });
    });

    // Load saved city
    const savedCity = sessionStorage.getItem('selectedCity');
    if (savedCity) cityLabel.textContent = savedCity;
  }

  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', String(isOpen));
    });
  }

  document.querySelectorAll('.dropdown').forEach(dropdown => {
    const button = dropdown.querySelector('.dropdown-btn');
    if (!button) return;

    button.addEventListener('click', (e) => {
      e.stopPropagation();
      const wasOpen = dropdown.classList.contains('open');
      document.querySelectorAll('.dropdown').forEach(item => item.classList.remove('open'));
      if (!wasOpen) dropdown.classList.add('open');
      button.setAttribute('aria-expanded', String(!wasOpen));
    });
  });

  document.addEventListener('click', (e) => {
    if (cityPicker && !cityPicker.contains(e.target)) {
      cityPicker.classList.remove('open');
    }
    document.querySelectorAll('.dropdown').forEach(dropdown => {
      dropdown.classList.remove('open');
      const button = dropdown.querySelector('.dropdown-btn');
      if (button) button.setAttribute('aria-expanded', 'false');
    });
  });

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
