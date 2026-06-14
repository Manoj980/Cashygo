/**
 * Camera Issue Page JavaScript
 * Handles functional issues multi-select and price calculation
 */

(function() {
  'use strict';

  // ── FUNCTIONAL ISSUES DATA ──
  const functionalIssues = [
    { id: 'shutter', title: 'Shutter mechanism faulty', desc: 'Camera fails to capture or shutter gets stuck', icon: 'bi-record-circle', price: 7200 },
    { id: 'autofocus-motor', title: 'Autofocus motor issue', desc: 'Focus hunts, fails or makes abnormal sound', icon: 'bi-crosshair', price: 5200 },
    { id: 'lcd', title: 'LCD screen not working', desc: 'LCD is blank, cracked, dim or flickering', icon: 'bi-display', price: 4600 },
    { id: 'viewfinder', title: 'Viewfinder not working', desc: 'EVF/OVF has display or clarity issue', icon: 'bi-eye', price: 3800 },
    { id: 'memory-slot', title: 'Memory card slot faulty', desc: 'Card is not detected or gets disconnected', icon: 'bi-sd-card', price: 3600 },
    { id: 'usb-hdmi', title: 'USB/HDMI port faulty', desc: 'Cable ports are loose, broken or not detecting', icon: 'bi-usb-plug', price: 3000 },
    { id: 'buttons', title: 'Buttons or dial not working', desc: 'Mode dial, shutter button or controls are faulty', icon: 'bi-toggle2-off', price: 3500 },
    { id: 'flash', title: 'Built-in flash not working', desc: 'Flash does not open, fire or sync properly', icon: 'bi-lightning-charge', price: 2400 },
    { id: 'hot-shoe', title: 'Hot shoe damaged', desc: 'External flash or trigger mount is damaged', icon: 'bi-lightning', price: 1800 },
    { id: 'wifi', title: 'WiFi or Bluetooth not working', desc: 'Wireless transfer or app pairing does not work', icon: 'bi-wifi-off', price: 2200 },
    { id: 'tripod', title: 'Tripod mount damaged', desc: 'Bottom mount is loose, stripped or broken', icon: 'bi-webcam', price: 1600 },
    { id: 'speaker-mic', title: 'Mic or speaker faulty', desc: 'Recorded sound or playback audio has issues', icon: 'bi-mic-mute', price: 1900 }
  ];

  // ── STATE ──
  const state = {
    selected: [],
    selection: {},
    condition: {}
  };

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

  // ── DOM ELEMENTS ──
  const issueGrid = document.getElementById('issueGrid');
  const selectedCount = document.getElementById('selectedCount');
  const quotePrice = document.getElementById('quotePrice');
  const deductionText = document.getElementById('deductionText');
  const basePrice = document.getElementById('basePrice');
  const functionalDeduction = document.getElementById('functionalDeduction');
  const issueSummaryEl = document.getElementById('issueSummary');
  const continueBtn = document.getElementById('continueBtn');
  const deviceName = document.getElementById('deviceName');
  const deviceMeta = document.getElementById('deviceMeta');

  // ── CALCULATIONS ──
  function selectedIssues() {
    return functionalIssues.filter(issue => state.selected.includes(issue.id));
  }

  function totalDeduction() {
    return selectedIssues().reduce((sum, issue) => sum + (Number(issue.price) || 0), 0);
  }

  function getBasePrice() {
    const issueSummary = readJSON('cashygoCameraIssueSummary', {});
    return Number(issueSummary.finalQuote) || Number(state.selection.price) || 76000;
  }

  function finalQuote() {
    return Math.max(getBasePrice() - totalDeduction(), 0);
  }

  // ── RENDER ISSUES GRID ──
  function renderIssues() {
    if (!issueGrid) return;

    issueGrid.innerHTML = functionalIssues.map(issue => {
      const isSelected = state.selected.includes(issue.id);
      return `
        <button class="issue-card ${isSelected ? 'selected' : ''}" type="button" data-issue="${issue.id}">
          <span class="issue-card-icon">
            <span class="card-check"><i class="bi bi-check-lg"></i></span>
            <i class="bi ${issue.icon}"></i>
          </span>
          <span>
            <span class="issue-title">${issue.title}</span>
            <span class="issue-desc">${issue.desc}</span>
          </span>
        </button>`;
    }).join('');

    // Attach click handlers
    issueGrid.querySelectorAll('[data-issue]').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.issue;
        const index = state.selected.indexOf(id);
        if (index > -1) {
          state.selected.splice(index, 1);
        } else {
          state.selected.push(id);
        }
        renderIssues();
        renderSummary();
      });
    });
  }

  // ── RENDER SUMMARY ──
  function renderSummary() {
    const selected = selectedIssues();
    const deduction = totalDeduction();
    const startingQuote = getBasePrice();

    if (selectedCount) {
      selectedCount.textContent = selected.length;
    }

    if (quotePrice) {
      quotePrice.textContent = rupee.format(finalQuote());
    }

    if (basePrice) {
      basePrice.textContent = rupee.format(startingQuote);
    }

    if (functionalDeduction) {
      functionalDeduction.textContent = deduction ? '-' + rupee.format(deduction) : rupee.format(0);
    }

    if (deductionText) {
      deductionText.textContent = deduction
        ? 'Quote reduced by ' + rupee.format(deduction) + ' for functional issues'
        : 'No functional issue deduction';
    }

    if (issueSummaryEl) {
      issueSummaryEl.textContent = selected.length ? selected.length + ' selected' : 'None';
    }
  }

  // ── SAVE AND CONTINUE ──
  function saveFunctionalSummary() {
    const issueSummaryData = readJSON('cashygoCameraIssueSummary', {});

    const summary = {
      selectedIssues: selectedIssues(),
      functionalDeduction: totalDeduction(),
      finalQuote: finalQuote(),
      completedAt: new Date().toISOString()
    };

    sessionStorage.setItem('cashygoCameraFunctionalIssues', JSON.stringify(summary));
    sessionStorage.setItem('cashygoFunctionalIssues', JSON.stringify(summary));
    sessionStorage.setItem('cashygoIssueSummary', JSON.stringify({
      ...issueSummaryData,
      selection: state.selection,
      condition: state.condition,
      finalQuote: getBasePrice()
    }));

    // Map to order.html expected format
    sessionStorage.setItem('cashygoSelection', JSON.stringify({
      model: state.selection.model,
      storage: state.selection.type,
      color: state.selection.brand,
      price: state.selection.price,
      image: 'assets/images/project-logo/logo-new.svg'
    }));

    sessionStorage.setItem('cashygoCondition', JSON.stringify({
      age: state.condition.shutter,
      billBox: [state.condition.body, state.condition.accessories].filter(Boolean).join(', ')
    }));
  }

  // ── INITIALIZE ──
  function init() {
    // Load data from session
    state.selection = readJSON('cashygoCameraSelection', {
      brand: 'Sony',
      model: 'Sony Alpha A7 III',
      type: 'Mirrorless Camera',
      price: 76000
    });

    state.condition = readJSON('cashygoCameraCondition', {
      shutter: 'Below 10,000 clicks',
      body: 'Excellent body condition',
      accessories: 'Original lens available'
    });

    // Restore previously selected issues
    const savedFunctional = readJSON('cashygoCameraFunctionalIssues', { selectedIssues: [] });
    state.selected = Array.isArray(savedFunctional.selectedIssues)
      ? savedFunctional.selectedIssues.map(issue => typeof issue === 'object' ? issue.id : issue).filter(Boolean)
      : [];

    // Update device info
    if (deviceName) deviceName.textContent = state.selection.model;
    if (deviceMeta) {
      deviceMeta.textContent = `${state.selection.brand} - ${state.selection.type}`;
    }

    // Render
    renderIssues();
    renderSummary();

    // Continue button handler
    if (continueBtn) {
      continueBtn.addEventListener('click', () => {
        saveFunctionalSummary();
        window.location.href = 'order.html';
      });
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
