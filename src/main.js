/**
 * Main application entry point
 */

import { AppState } from './state/AppState.js';
import { DepartmentSelector } from './components/DepartmentSelector.js';
import { CategoryTree } from './components/CategoryTree.js';
import { Preview } from './components/Preview.js';
import { PromptOutput } from './components/PromptOutput.js';
import { CategoryEditor } from './components/CategoryEditor.js';

// DOM Elements
let elements = {};

/**
 * Initialize DOM element references
 */
function initElements() {
  elements = {
    departmentNav: document.querySelector('[data-testid="department-nav"]'),
    categoryTree: document.querySelector('[data-testid="category-tree"]'),
    preview: document.querySelector('[data-testid="preview"]'),
    promptText: document.querySelector('[data-testid="prompt-text"]'),
    copyBtn: document.querySelector('[data-testid="copy-prompt"]'),
    editBtn: document.querySelector('[data-testid="edit-categories"]'),
    resetBtn: document.querySelector('[data-testid="reset-defaults"]'),
    modal: document.querySelector('#edit-modal')
  };
}

/**
 * Render the entire UI based on current state
 * @param {Object} state - Current application state
 */
function renderApp(state) {
  const { selectedDepartment, categories, isLoading } = state;

  // Update department selector
  DepartmentSelector.updateSelected(elements.departmentNav, selectedDepartment);

  // Show/hide toolbar based on department selection
  const toolbar = document.querySelector('.toolbar');
  if (toolbar) {
    toolbar.style.display = selectedDepartment ? 'flex' : 'none';
  }

  // Render category tree
  CategoryTree.render(elements.categoryTree, categories, {
    onStatusChange: (itemId, status) => AppState.setStatus(itemId, status),
    onCommentChange: (itemId, comment) => AppState.setComment(itemId, comment)
  });

  // Render preview
  Preview.render(elements.preview, selectedDepartment, categories);

  // Render prompt
  PromptOutput.render(elements.promptText, selectedDepartment, categories);
}

/**
 * Initialize the application
 */
function init() {
  initElements();

  // Render department selector (one-time, with event listeners)
  DepartmentSelector.render(
    elements.departmentNav,
    null,
    (department) => AppState.selectDepartment(department)
  );

  // Set up copy button
  PromptOutput.setupCopyButton(elements.copyBtn, elements.promptText);

  // Set up edit modal
  CategoryEditor.setup(elements.modal, elements.editBtn, (newCategories) => {
    AppState.updateCategories(newCategories);
  });

  // Edit button opens modal
  elements.editBtn?.addEventListener('click', () => {
    const state = AppState.getState();
    if (state.selectedDepartment) {
      CategoryEditor.open(elements.modal, state.categories, (newCategories) => {
        AppState.updateCategories(newCategories);
      });
    }
  });

  // Reset button
  elements.resetBtn?.addEventListener('click', () => {
    const confirmed = confirm('Reset to defaults? This will clear all your changes for this department.');
    if (confirmed) {
      AppState.resetToDefaults();
    }
  });

  // Subscribe to state changes
  AppState.subscribe(renderApp);

  // Initialize state from localStorage
  AppState.init();

  // Initial render
  renderApp(AppState.getState());
}

// Start app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
