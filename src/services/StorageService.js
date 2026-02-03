/**
 * Service for persisting application state to localStorage
 */

const STORAGE_KEY = 'dppgc_state';

export const StorageService = {
  /**
   * Get the entire application state from localStorage
   * @returns {Object|null} The saved state or null if not found/invalid
   */
  getState() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return null;
      return JSON.parse(data);
    } catch (error) {
      console.error('Failed to parse stored state:', error);
      return null;
    }
  },

  /**
   * Save the entire application state to localStorage
   * @param {Object} state - The state to save
   */
  saveState(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save state:', error);
      throw error;
    }
  },

  /**
   * Get saved state for a specific department
   * @param {string} department - The department name
   * @returns {Object|null} The department state or null if not found
   */
  getDepartmentState(department) {
    const state = this.getState();
    if (!state || !state.departments) return null;
    return state.departments[department] || null;
  },

  /**
   * Save state for a specific department
   * @param {string} department - The department name
   * @param {Object} deptState - The department state to save
   */
  saveDepartmentState(department, deptState) {
    const state = this.getState() || {
      selectedDepartment: null,
      departments: {}
    };

    state.departments[department] = deptState;
    this.saveState(state);
  },

  /**
   * Clear saved state for a specific department
   * @param {string} department - The department name
   */
  clearDepartmentState(department) {
    const state = this.getState();
    if (!state || !state.departments) return;

    delete state.departments[department];
    this.saveState(state);
  },

  /**
   * Get the currently selected department
   * @returns {string|null} The selected department or null
   */
  getSelectedDepartment() {
    const state = this.getState();
    return state?.selectedDepartment || null;
  },

  /**
   * Set the selected department
   * @param {string} department - The department to select
   */
  setSelectedDepartment(department) {
    const state = this.getState() || {
      selectedDepartment: null,
      departments: {}
    };

    state.selectedDepartment = department;
    this.saveState(state);
  },

  /**
   * Clear all saved state
   */
  clearAll() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear state:', error);
      throw error;
    }
  }
};
