/**
 * Category Editor modal component - for editing category structure
 */

import { escapeHtml } from '../utils/escapeHtml.js';
import { generateId } from '../utils/generateId.js';
import { cloneTree, findNodeById, getNodeDepth } from '../utils/treeUtils.js';

const MAX_DEPTH = 3;

export const CategoryEditor = {
  // Internal state for editing
  _editingTree: [],
  _onSave: null,
  _modal: null,

  /**
   * Open the editor modal
   * @param {HTMLElement} modal - Modal element
   * @param {Array} categories - Current categories to edit
   * @param {Function} onSave - Callback with edited categories
   */
  open(modal, categories, onSave) {
    this._modal = modal;
    this._editingTree = cloneTree(categories);
    this._onSave = onSave;

    this.renderTree();
    modal.setAttribute('aria-hidden', 'false');

    // Focus first input or close button
    const firstFocusable = modal.querySelector('button, input');
    if (firstFocusable) firstFocusable.focus();
  },

  /**
   * Close the modal without saving
   */
  close() {
    if (this._modal) {
      this._modal.setAttribute('aria-hidden', 'true');
      this._editingTree = [];
      this._onSave = null;
    }
  },

  /**
   * Save changes and close
   */
  save() {
    if (this._onSave) {
      this._onSave(this._editingTree);
    }
    this.close();
  },

  /**
   * Render the editable tree in the modal body
   */
  renderTree() {
    const container = this._modal.querySelector('#modal-tree');
    if (!container) return;

    container.innerHTML = `
      ${this._editingTree.map((cat, idx) => this.renderEditCategory(cat, idx, 1)).join('')}
      <button class="add-item-btn" data-action="add-category">+ Add Category</button>
    `;
    // NOTE: Event listeners are attached ONCE in setup() via event delegation
  },

  /**
   * Render a category for editing
   * @param {Object} category - Category data
   * @param {number} index - Index in parent array
   * @param {number} depth - Current depth
   * @returns {string} HTML string
   */
  renderEditCategory(category, index, depth) {
    const hasChildren = category.children && category.children.length > 0;
    const canAddChild = depth < MAX_DEPTH;

    return `
      <div class="edit-item" data-id="${escapeHtml(category.id)}" data-depth="${depth}">
        <input type="text" value="${escapeHtml(category.label)}" data-action="rename">
        <div class="edit-item-actions">
          <button data-action="move-up" title="Move up" ${index === 0 ? 'disabled' : ''}>↑</button>
          <button data-action="move-down" title="Move down">↓</button>
          <button data-action="delete" title="Delete">🗑</button>
        </div>
      </div>
      <div class="edit-children">
        ${hasChildren ? category.children.map((child, idx) =>
          this.renderEditItem(child, idx, depth + 1, category.children.length)
        ).join('') : ''}
        ${canAddChild ? `<button class="add-item-btn" data-action="add-child" data-parent="${escapeHtml(category.id)}">+ Add Item</button>` : ''}
      </div>
    `;
  },

  /**
   * Render an item for editing
   * @param {Object} item - Item data
   * @param {number} index - Index in parent array
   * @param {number} depth - Current depth
   * @param {number} siblingCount - Number of siblings
   * @returns {string} HTML string
   */
  renderEditItem(item, index, depth, siblingCount) {
    const hasChildren = item.children && item.children.length > 0;
    const canAddChild = depth < MAX_DEPTH;
    const isLast = index === siblingCount - 1;

    let html = `
      <div class="edit-item" data-id="${escapeHtml(item.id)}" data-depth="${depth}">
        <input type="text" value="${escapeHtml(item.label)}" data-action="rename">
        <div class="edit-item-actions">
          <button data-action="move-up" title="Move up" ${index === 0 ? 'disabled' : ''}>↑</button>
          <button data-action="move-down" title="Move down" ${isLast ? 'disabled' : ''}>↓</button>
          <button data-action="delete" title="Delete">🗑</button>
        </div>
      </div>
    `;

    if (hasChildren || canAddChild) {
      html += `
        <div class="edit-children">
          ${hasChildren ? item.children.map((child, idx) =>
            this.renderEditItem(child, idx, depth + 1, item.children.length)
          ).join('') : ''}
          ${canAddChild ? `<button class="add-item-btn" data-action="add-child" data-parent="${escapeHtml(item.id)}">+ Add Sub-item</button>` : ''}
        </div>
      `;
    }

    return html;
  },

  /**
   * Attach tree event listeners ONCE to modal (called from setup)
   * Uses event delegation so new tree items automatically work
   * @param {HTMLElement} modal - Modal element (stable, not replaced on re-render)
   */
  attachTreeListeners(modal) {
    // Click handler for buttons (add, move, delete)
    modal.addEventListener('click', (e) => {
      // Only handle if modal is open and target has action
      if (modal.getAttribute('aria-hidden') !== 'false') return;

      const action = e.target.dataset.action;
      if (!action) return;

      const itemEl = e.target.closest('.edit-item');
      const itemId = itemEl?.dataset.id;

      switch (action) {
        case 'add-category':
          this.addCategory();
          break;
        case 'add-child':
          this.addChild(e.target.dataset.parent);
          break;
        case 'move-up':
          this.moveItem(itemId, 'up');
          break;
        case 'move-down':
          this.moveItem(itemId, 'down');
          break;
        case 'delete':
          this.deleteItem(itemId);
          break;
      }
    });

    // Handle rename on blur
    modal.addEventListener('change', (e) => {
      // Only handle if modal is open
      if (modal.getAttribute('aria-hidden') !== 'false') return;

      if (e.target.dataset.action === 'rename') {
        const itemEl = e.target.closest('.edit-item');
        const itemId = itemEl?.dataset.id;
        const newLabel = e.target.value.trim();

        if (newLabel && itemId) {
          this.renameItem(itemId, newLabel);
        } else if (!newLabel) {
          // Revert to original
          this.renderTree();
        }
      }
    });
  },

  /**
   * Add a new top-level category
   */
  addCategory() {
    const newCategory = {
      id: generateId(),
      label: 'New Category',
      status: null,
      comment: '',
      children: []
    };
    this._editingTree.push(newCategory);
    this.renderTree();
  },

  /**
   * Add a child item to a parent
   * @param {string} parentId - Parent node ID
   */
  addChild(parentId) {
    const parent = findNodeById(this._editingTree, parentId);
    if (!parent) return;

    const newItem = {
      id: generateId(),
      label: 'New Item',
      status: 'red',
      comment: '',
      children: []
    };

    if (!parent.children) parent.children = [];
    parent.children.push(newItem);

    // Parent now has children, ensure status is null
    parent.status = null;

    this.renderTree();
  },

  /**
   * Move an item up or down
   * @param {string} itemId - Item ID
   * @param {string} direction - 'up' or 'down'
   */
  moveItem(itemId, direction) {
    const moveInArray = (arr) => {
      const index = arr.findIndex(n => n.id === itemId);
      if (index !== -1) {
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex >= 0 && newIndex < arr.length) {
          const [item] = arr.splice(index, 1);
          arr.splice(newIndex, 0, item);
        }
        return true;
      }
      for (const node of arr) {
        if (node.children && moveInArray(node.children)) return true;
      }
      return false;
    };

    moveInArray(this._editingTree);
    this.renderTree();
  },

  /**
   * Delete an item (recursive)
   * @param {string} itemId - Item ID
   */
  deleteItem(itemId) {
    const node = findNodeById(this._editingTree, itemId);
    const hasChildren = node?.children?.length > 0;

    if (hasChildren) {
      const confirmed = confirm(`Delete "${node.label}" and all sub-items?`);
      if (!confirmed) return;
    }

    const deleteFromArray = (arr) => {
      const index = arr.findIndex(n => n.id === itemId);
      if (index !== -1) {
        arr.splice(index, 1);
        return true;
      }
      for (const n of arr) {
        if (n.children && deleteFromArray(n.children)) return true;
      }
      return false;
    };

    deleteFromArray(this._editingTree);
    this.renderTree();
  },

  /**
   * Rename an item
   * @param {string} itemId - Item ID
   * @param {string} newLabel - New label
   */
  renameItem(itemId, newLabel) {
    const node = findNodeById(this._editingTree, itemId);
    if (node) {
      node.label = newLabel;
    }
  },

  /**
   * Set up modal event listeners
   * @param {HTMLElement} modal - Modal element
   * @param {HTMLElement} openBtn - Button that opens modal
   * @param {Function} onSave - Save callback
   */
  setup(modal, openBtn, onSave) {
    // Close button
    const closeBtn = modal.querySelector('[data-testid="modal-close"]');
    closeBtn?.addEventListener('click', () => this.close());

    // Cancel button
    const cancelBtn = modal.querySelector('[data-testid="modal-cancel"]');
    cancelBtn?.addEventListener('click', () => this.close());

    // Save button
    const saveBtn = modal.querySelector('[data-testid="modal-save"]');
    saveBtn?.addEventListener('click', () => {
      const confirmed = confirm('This will reset all selections and comments. Continue?');
      if (confirmed) this.save();
    });

    // Click outside to close
    modal.addEventListener('click', (e) => {
      if (e.target === modal) this.close();
    });

    // Escape key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') {
        this.close();
      }
    });

    // Attach tree event listeners ONCE via delegation on the modal
    // This prevents listener accumulation when renderTree() is called multiple times
    this.attachTreeListeners(modal);

    // Store onSave callback
    this._onSave = onSave;
  }
};
