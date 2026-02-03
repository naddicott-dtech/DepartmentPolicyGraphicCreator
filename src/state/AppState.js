/**
 * Central application state management with reactive subscriptions
 */

import { DefaultsService } from '../services/DefaultsService.js';
import { StorageService } from '../services/StorageService.js';
import { CategoryService } from '../services/CategoryService.js';
import { cloneTree } from '../utils/treeUtils.js';

/**
 * Creates a new AppState instance
 * @returns {Object} AppState API
 */
export function createAppState() {
  // Internal state
  let state = {
    selectedDepartment: null,
    categories: [],
    isCustomized: false,
    isLoading: true
  };

  // Subscribers for reactive updates
  const subscribers = new Set();

  /**
   * Notify all subscribers of state change
   */
  function notify() {
    const currentState = getState();
    subscribers.forEach(callback => callback(currentState));
  }

  /**
   * Persist current department state to localStorage
   */
  function persist() {
    if (!state.selectedDepartment) return;

    StorageService.saveDepartmentState(state.selectedDepartment, {
      categories: state.categories,
      isCustomized: state.isCustomized
    });
    StorageService.setSelectedDepartment(state.selectedDepartment);
  }

  /**
   * Get a copy of current state
   * @returns {Object} Current state
   */
  function getState() {
    return {
      selectedDepartment: state.selectedDepartment,
      categories: cloneTree(state.categories),
      isCustomized: state.isCustomized,
      isLoading: state.isLoading
    };
  }

  /**
   * Subscribe to state changes
   * @param {Function} callback - Called with new state on changes
   * @returns {Function} Unsubscribe function
   */
  function subscribe(callback) {
    subscribers.add(callback);
    return () => subscribers.delete(callback);
  }

  /**
   * Initialize state from localStorage or defaults
   */
  function init() {
    const savedDepartment = StorageService.getSelectedDepartment();

    if (savedDepartment) {
      const savedState = StorageService.getDepartmentState(savedDepartment);

      if (savedState) {
        state = {
          selectedDepartment: savedDepartment,
          categories: savedState.categories,
          isCustomized: savedState.isCustomized || false,
          isLoading: false
        };
      } else {
        // Department selected but no saved state - load defaults
        const defaults = DefaultsService.getDefaultCategories(savedDepartment);
        state = {
          selectedDepartment: savedDepartment,
          categories: defaults.categories,
          isCustomized: false,
          isLoading: false
        };
      }
    } else {
      state.isLoading = false;
    }

    notify();
  }

  /**
   * Select a department
   * @param {string} department - Department name
   */
  function selectDepartment(department) {
    if (state.selectedDepartment === department) return;

    // Check for saved state
    const savedState = StorageService.getDepartmentState(department);

    if (savedState) {
      state = {
        selectedDepartment: department,
        categories: savedState.categories,
        isCustomized: savedState.isCustomized || false,
        isLoading: false
      };
    } else {
      // Load defaults
      const defaults = DefaultsService.getDefaultCategories(department);
      state = {
        selectedDepartment: department,
        categories: defaults.categories,
        isCustomized: false,
        isLoading: false
      };
    }

    persist();
    notify();
  }

  /**
   * Set status for a leaf node
   * @param {string} nodeId - Node ID
   * @param {string} status - 'green', 'yellow', or 'red'
   */
  function setStatus(nodeId, status) {
    const result = CategoryService.setStatus(state.categories, nodeId, status);

    if (result.error) {
      console.error('setStatus error:', result.error);
      return;
    }

    state.categories = result.categories;
    persist();
    notify();
  }

  /**
   * Set comment for a node
   * @param {string} nodeId - Node ID
   * @param {string} comment - Comment text
   */
  function setComment(nodeId, comment) {
    const result = CategoryService.setComment(state.categories, nodeId, comment);

    if (result.error) {
      console.error('setComment error:', result.error);
      return;
    }

    state.categories = result.categories;
    persist();
    notify();
  }

  /**
   * Reset current department to template defaults
   */
  function resetToDefaults() {
    if (!state.selectedDepartment) return;

    const defaults = DefaultsService.getDefaultCategories(state.selectedDepartment);
    state.categories = defaults.categories;
    state.isCustomized = false;

    // Clear saved state for this department
    StorageService.clearDepartmentState(state.selectedDepartment);
    persist();
    notify();
  }

  /**
   * Update categories (from edit modal)
   * @param {Array} newCategories - New category structure
   */
  function updateCategories(newCategories) {
    // Reset statuses to red and clear comments
    const resetCategories = CategoryService.resetToDefaults(newCategories);

    state.categories = resetCategories;
    state.isCustomized = true;

    persist();
    notify();
  }

  // Public API
  return {
    getState,
    subscribe,
    init,
    selectDepartment,
    setStatus,
    setComment,
    resetToDefaults,
    updateCategories
  };
}

// Default singleton instance
export const AppState = createAppState();
