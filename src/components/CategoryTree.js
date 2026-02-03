/**
 * Category tree component - renders categories with traffic lights and comments
 */

import { escapeHtml } from '../utils/escapeHtml.js';

export const CategoryTree = {
  // AbortController to clean up old listeners on re-render
  _abortController: null,

  /**
   * Render the category tree
   * @param {HTMLElement} container - Tree container
   * @param {Array} categories - Category data
   * @param {Object} callbacks - Event callbacks { onStatusChange, onCommentChange }
   */
  render(container, categories, callbacks) {
    if (!categories || categories.length === 0) {
      // Abort any existing listeners before clearing
      if (this._abortController) {
        this._abortController.abort();
        this._abortController = null;
      }
      container.innerHTML = '<p class="empty-state">Select a department to get started.</p>';
      return;
    }

    // Skip re-render if a comment field in this container has focus
    // This prevents destroying the input while user is typing
    const activeEl = document.activeElement;
    if (activeEl &&
        activeEl.classList.contains('comment-field') &&
        container.contains(activeEl)) {
      return;
    }

    // Abort previous listeners before adding new ones
    if (this._abortController) {
      this._abortController.abort();
    }

    container.innerHTML = categories.map(category => this.renderCategory(category)).join('');

    this.attachEventListeners(container, callbacks);
  },

  /**
   * Render a single category with its children
   * @param {Object} category - Category data
   * @returns {string} HTML string
   */
  renderCategory(category) {
    const childrenHtml = category.children && category.children.length > 0
      ? category.children.map(item => this.renderItem(item)).join('')
      : '';

    return `
      <div class="category" data-testid="category-${escapeHtml(category.id)}">
        <h2 class="category-label">${escapeHtml(category.label)}</h2>
        ${childrenHtml}
      </div>
    `;
  },

  /**
   * Render a single policy item with traffic light and comment
   * @param {Object} item - Item data
   * @returns {string} HTML string
   */
  renderItem(item) {
    const statusChecked = (status) => item.status === status ? 'checked' : '';
    const commentValue = escapeHtml(item.comment || '');

    return `
      <div class="policy-item" data-testid="item-${escapeHtml(item.id)}" data-item-id="${escapeHtml(item.id)}">
        <span class="item-label">${escapeHtml(item.label)}</span>

        <fieldset class="traffic-light" data-testid="status-${escapeHtml(item.id)}">
          <legend class="visually-hidden">AI policy for ${escapeHtml(item.label)}</legend>

          <input type="radio" name="status-${escapeHtml(item.id)}" value="green"
                 id="${escapeHtml(item.id)}-green" ${statusChecked('green')}>
          <label for="${escapeHtml(item.id)}-green" class="status-green" title="OK">✓</label>

          <input type="radio" name="status-${escapeHtml(item.id)}" value="yellow"
                 id="${escapeHtml(item.id)}-yellow" ${statusChecked('yellow')}>
          <label for="${escapeHtml(item.id)}-yellow" class="status-yellow" title="Ask First">?</label>

          <input type="radio" name="status-${escapeHtml(item.id)}" value="red"
                 id="${escapeHtml(item.id)}-red" ${statusChecked('red')}>
          <label for="${escapeHtml(item.id)}-red" class="status-red" title="Not Allowed">✗</label>
        </fieldset>

        <input type="text" class="comment-field"
               data-testid="comment-${escapeHtml(item.id)}"
               placeholder="Add clarification..."
               value="${commentValue}">
      </div>
    `;
  },

  /**
   * Attach event listeners using delegation
   * @param {HTMLElement} container - Tree container
   * @param {Object} callbacks - Event callbacks
   */
  attachEventListeners(container, callbacks) {
    const { onStatusChange, onCommentChange } = callbacks;

    // Create new AbortController for this render cycle
    this._abortController = new AbortController();
    const { signal } = this._abortController;

    // Status change (radio buttons)
    container.addEventListener('change', (e) => {
      if (e.target.type === 'radio' && e.target.name.startsWith('status-')) {
        const itemId = e.target.name.replace('status-', '');
        const status = e.target.value;
        onStatusChange(itemId, status);
      }
    }, { signal });

    // Comment change (debounced on input)
    let commentTimeout;
    container.addEventListener('input', (e) => {
      if (e.target.classList.contains('comment-field')) {
        const item = e.target.closest('.policy-item');
        if (item) {
          const itemId = item.dataset.itemId;
          const comment = e.target.value;

          // Debounce comment updates
          clearTimeout(commentTimeout);
          commentTimeout = setTimeout(() => {
            onCommentChange(itemId, comment);
          }, 300);
        }
      }
    }, { signal });
  }
};
