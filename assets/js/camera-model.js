/**
 * Camera Model Page JavaScript
 * Handles search filtering and model card interactions
 */

(function() {
  'use strict';

  // ── DOM ELEMENTS ──
  const searchInput = document.querySelector('.camera-search input');
  const modelGrid = document.querySelector('.model-grid');
  const modelCards = document.querySelectorAll('.model-card');

  // ── SEARCH FUNCTIONALITY ──
  function filterModels(query) {
    const searchTerm = query.toLowerCase().trim();
    let visibleCount = 0;

    modelCards.forEach(card => {
      const title = card.querySelector('.model-title')?.textContent.toLowerCase() || '';
      const brand = card.querySelector('.model-brand')?.textContent.toLowerCase() || '';
      const meta = card.querySelector('.model-meta')?.textContent.toLowerCase() || '';
      const searchableText = `${title} ${brand} ${meta}`;

      if (searchableText.includes(searchTerm) || searchTerm === '') {
        card.style.display = '';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    // Show/hide no results message
    handleNoResults(visibleCount, searchTerm);
  }

  function handleNoResults(count, term) {
    let noResultsEl = document.querySelector('.no-results-message');

    if (count === 0 && term !== '') {
      if (!noResultsEl) {
        noResultsEl = document.createElement('div');
        noResultsEl.className = 'no-results-message';
        noResultsEl.innerHTML = `
          <i class="bi bi-search"></i>
          <p>No camera models found for "<strong>${term}</strong>"</p>
          <span>Try a different search term or browse all models below</span>
        `;
        modelGrid.parentNode.insertBefore(noResultsEl, modelGrid.nextSibling);
      } else {
        noResultsEl.querySelector('strong').textContent = term;
        noResultsEl.style.display = 'block';
      }
    } else if (noResultsEl) {
      noResultsEl.style.display = 'none';
    }
  }

  // ── EVENT LISTENERS ──
  if (searchInput) {
    // Debounce search for performance
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        filterModels(e.target.value);
      }, 200);
    });

    // Handle form submission
    const searchForm = searchInput.closest('form');
    if (searchForm) {
      searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        filterModels(searchInput.value);
        // Scroll to models section
        const modelsSection = document.getElementById('top-selling-models');
        if (modelsSection) {
          modelsSection.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }
  }

  // ── CITY PICKER ──
  const cityPicker = document.getElementById('cityPicker');
  const cityLabel = document.getElementById('cityLabel');

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
        // Store city preference
        sessionStorage.setItem('selectedCity', item.dataset.city);
      });
    });

    // Load saved city
    const savedCity = sessionStorage.getItem('selectedCity');
    if (savedCity) {
      cityLabel.textContent = savedCity;
    }
  }

  // ── HAMBURGER MENU ──
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('navMenu');

  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', String(isOpen));
    });
  }

  // ── DROPDOWNS ──
  document.querySelectorAll('.dropdown').forEach(dropdown => {
    const button = dropdown.querySelector('.dropdown-btn');
    if (!button) return;

    button.addEventListener('click', (e) => {
      e.stopPropagation();
      const wasOpen = dropdown.classList.contains('open');
      // Close all dropdowns
      document.querySelectorAll('.dropdown').forEach(item => item.classList.remove('open'));
      if (!wasOpen) dropdown.classList.add('open');
      button.setAttribute('aria-expanded', String(!wasOpen));
    });
  });

  // ── CLOSE ON OUTSIDE CLICK ──
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

  // ── MODEL CARD CLICK TRACKING ──
  modelCards.forEach(card => {
    card.addEventListener('click', () => {
      const modelName = card.querySelector('.model-title')?.textContent || 'Unknown';
      const brandName = card.querySelector('.model-brand')?.textContent || 'Unknown';

      // Store selection in session
      sessionStorage.setItem('cameraModel', modelName);
      sessionStorage.setItem('cameraBrand', brandName);
    });
  });

})();
