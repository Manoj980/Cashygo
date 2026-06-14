/**
 * Camera Condition Page JavaScript
 * Handles shutter count and body condition selection
 */

(function() {
  'use strict';

  // ── STATE ──
  const state = {
    selection: {},
    condition: {
      shutter: '',
      body: ''
    }
  };

  // ── DOM ELEMENTS ──
  const panelBrand = document.getElementById('panelBrand');
  const panelModel = document.getElementById('panelModel');
  const panelSpec = document.getElementById('panelSpec');
  const summaryBrand = document.getElementById('summaryBrand');
  const summaryModel = document.getElementById('summaryModel');
  const summaryType = document.getElementById('summaryType');
  const estimatedPrice = document.getElementById('estimatedPrice');
  const progressPill = document.getElementById('progressPill');
  const conditionContinue = document.getElementById('conditionContinue');
  const shutterSection = document.getElementById('shutterSection');
  const bodySection = document.getElementById('bodySection');
  const shutterRow = document.getElementById('shutterRow');
  const shutterVal = document.getElementById('shutterVal');
  const bodyRow = document.getElementById('bodyRow');
  const bodyVal = document.getElementById('bodyVal');

  // ── UTILITIES ──
  function fmt(amount) {
    return '\u20B9' + Number(amount || 0).toLocaleString('en-IN');
  }

  function readJSON(key, fallback) {
    try {
      return { ...fallback, ...JSON.parse(sessionStorage.getItem(key) || '{}') };
    } catch (e) {
      return fallback;
    }
  }

  // ── HYDRATE PANEL ──
  function hydratePanel() {
    if (panelBrand) panelBrand.textContent = state.selection.brand;
    if (panelModel) panelModel.textContent = state.selection.model;
    if (panelSpec) panelSpec.textContent = state.selection.type;
    if (summaryBrand) summaryBrand.textContent = state.selection.brand;
    if (summaryModel) summaryModel.textContent = state.selection.model;
    if (summaryType) summaryType.textContent = state.selection.type;

    if (estimatedPrice) {
      const price = Number(state.selection.price) || 0;
      const low = Math.round(price * 0.82);
      estimatedPrice.textContent = price ? `${fmt(low)} - ${fmt(price)}` : '\u20B90';
    }
  }

  // ── SET ROW ──
  function setRow(rowEl, valEl, done, value) {
    if (rowEl) rowEl.classList.toggle('done', done);
    if (valEl) valEl.textContent = done ? value : 'Pending';
  }

  // ── UPDATE SUMMARY ──
  function updateSummary() {
    const shutterDone = Boolean(state.condition.shutter);
    const bodyDone = Boolean(state.condition.body);

    setRow(shutterRow, shutterVal, shutterDone, state.condition.shutter);
    setRow(bodyRow, bodyVal, bodyDone, state.condition.body);

    const count = (shutterDone ? 1 : 0) + (bodyDone ? 1 : 0);
    if (progressPill) progressPill.textContent = `${count} / 2 Done`;
    if (conditionContinue) conditionContinue.disabled = count < 2;
  }

  // ── HANDLE OPTION CLICK ──
  function handleOptionClick(button) {
    const question = button.dataset.question;
    const value = button.dataset.value;

    state.condition[question] = value;

    // Update card states
    document.querySelectorAll(`[data-question="${question}"]`).forEach(item => {
      item.classList.remove('active');
    });
    button.classList.add('active');

    updateSummary();

    // Navigate to next section
    if (question === 'shutter' && shutterSection && bodySection) {
      shutterSection.classList.add('is-hidden');
      bodySection.classList.remove('is-hidden');
      bodySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // ── SAVE AND CONTINUE ──
  function saveAndContinue() {
    if (!state.condition.shutter || !state.condition.body) {
      return;
    }

    // Load existing condition data (accessories from previous page)
    const existingCondition = readJSON('cashygoCameraCondition', {});

    // Save condition data
    const updatedCondition = {
      ...existingCondition,
      shutter: state.condition.shutter,
      body: state.condition.body
    };

    sessionStorage.setItem('cashygoCameraCondition', JSON.stringify(updatedCondition));

    // Navigate to issues page
    window.location.href = 'camera_issu.html';
  }

  // ── INITIALIZE ──
  function init() {
    // Load selection data from URL params or session
    const params = new URLSearchParams(window.location.search);
    const storedSelection = readJSON('cashygoCameraSelection', {});

    state.selection = {
      brand: storedSelection.brand || params.get('brand') || 'Sony',
      model: storedSelection.model || params.get('model') || 'Sony Alpha A7 III',
      type: storedSelection.type || params.get('type') || 'Mirrorless Camera',
      price: Number(storedSelection.price || params.get('price') || 76000)
    };

    // Save selection to session
    sessionStorage.setItem('cashygoCameraSelection', JSON.stringify(state.selection));

    // Hydrate UI
    hydratePanel();
    updateSummary();

    // Attach click handlers to option cards
    document.querySelectorAll('[data-question]').forEach(button => {
      button.addEventListener('click', () => handleOptionClick(button));
    });

    // Continue button handler
    if (conditionContinue) {
      conditionContinue.addEventListener('click', saveAndContinue);
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
