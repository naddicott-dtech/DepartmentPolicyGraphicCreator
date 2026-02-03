import { jest } from '@jest/globals';
import { AppState, createAppState } from '../../src/state/AppState.js';

// Mock localStorage
let mockStorage = {};
beforeEach(() => {
  mockStorage = {};
  global.localStorage = {
    getItem: jest.fn((key) => mockStorage[key] || null),
    setItem: jest.fn((key, value) => { mockStorage[key] = value; }),
    removeItem: jest.fn((key) => { delete mockStorage[key]; }),
    clear: jest.fn(() => { mockStorage = {}; })
  };
});

afterEach(() => {
  delete global.localStorage;
});

describe('AppState', () => {
  describe('createAppState', () => {
    it('should create a fresh state instance', () => {
      const state = createAppState();
      expect(state).toBeDefined();
      expect(typeof state.getState).toBe('function');
      expect(typeof state.subscribe).toBe('function');
    });
  });

  describe('getState', () => {
    it('should return current state', () => {
      const state = createAppState();
      const current = state.getState();

      expect(current.selectedDepartment).toBeNull();
      expect(current.categories).toEqual([]);
      expect(current.isLoading).toBe(true);
    });
  });

  describe('selectDepartment', () => {
    it('should update selected department', () => {
      const state = createAppState();
      state.selectDepartment('English');

      expect(state.getState().selectedDepartment).toBe('English');
    });

    it('should load default categories for new department', () => {
      const state = createAppState();
      state.selectDepartment('Math');

      const current = state.getState();
      expect(current.categories.length).toBeGreaterThan(0);
      expect(current.categories[0].label).toBe('UNDERSTANDING');
    });

    it('should notify subscribers on change', () => {
      const state = createAppState();
      const callback = jest.fn();

      state.subscribe(callback);
      state.selectDepartment('Science');

      expect(callback).toHaveBeenCalled();
    });
  });

  describe('setStatus', () => {
    it('should update status for a leaf item', () => {
      const state = createAppState();
      state.selectDepartment('English');

      // Get an item ID from the loaded categories
      const itemId = state.getState().categories[0].children[0].id;
      state.setStatus(itemId, 'yellow');

      const item = state.getState().categories[0].children[0];
      expect(item.status).toBe('yellow');
    });
  });

  describe('setComment', () => {
    it('should update comment for an item', () => {
      const state = createAppState();
      state.selectDepartment('English');

      const itemId = state.getState().categories[0].children[0].id;
      state.setComment(itemId, 'Test comment');

      const item = state.getState().categories[0].children[0];
      expect(item.comment).toBe('Test comment');
    });
  });

  describe('subscribe', () => {
    it('should return unsubscribe function', () => {
      const state = createAppState();
      const callback = jest.fn();

      const unsubscribe = state.subscribe(callback);
      state.selectDepartment('Math');

      expect(callback).toHaveBeenCalledTimes(1);

      unsubscribe();
      state.selectDepartment('Science');

      expect(callback).toHaveBeenCalledTimes(1); // Not called again
    });

    it('should support multiple subscribers', () => {
      const state = createAppState();
      const cb1 = jest.fn();
      const cb2 = jest.fn();

      state.subscribe(cb1);
      state.subscribe(cb2);
      state.selectDepartment('Maker');

      expect(cb1).toHaveBeenCalled();
      expect(cb2).toHaveBeenCalled();
    });
  });

  describe('resetToDefaults', () => {
    it('should reset categories to defaults', () => {
      const state = createAppState();
      state.selectDepartment('English');

      // Change some statuses
      const itemId = state.getState().categories[0].children[0].id;
      state.setStatus(itemId, 'green');
      state.setComment(itemId, 'Modified');

      // Reset
      state.resetToDefaults();

      const current = state.getState();
      expect(current.categories[0].children[0].status).toBe('green'); // Default from template
      expect(current.categories[0].children[0].comment).toBe('');
    });
  });

  describe('updateCategories', () => {
    it('should update categories and reset statuses', () => {
      const state = createAppState();
      state.selectDepartment('English');

      const newCategories = [
        {
          id: 'custom1',
          label: 'Custom Category',
          status: null,
          comment: '',
          children: [
            { id: 'custom-item', label: 'Custom Item', status: 'red', comment: '', children: [] }
          ]
        }
      ];

      state.updateCategories(newCategories);

      const current = state.getState();
      expect(current.categories).toHaveLength(1);
      expect(current.categories[0].label).toBe('Custom Category');
      expect(current.isCustomized).toBe(true);
    });
  });

  describe('persistence', () => {
    it('should save state to localStorage on changes', () => {
      const state = createAppState();
      state.selectDepartment('English');

      expect(localStorage.setItem).toHaveBeenCalled();
    });

    it('should load state from localStorage on init', () => {
      // Set up existing state
      mockStorage['dppgc_state'] = JSON.stringify({
        selectedDepartment: 'Math',
        departments: {
          Math: {
            categories: [{ id: 'saved', label: 'Saved', status: null, comment: '', children: [] }],
            isCustomized: true
          }
        }
      });

      const state = createAppState();
      state.init();

      const current = state.getState();
      expect(current.selectedDepartment).toBe('Math');
      expect(current.isCustomized).toBe(true);
    });
  });
});
