import { jest } from '@jest/globals';
import { StorageService } from '../../src/services/StorageService.js';

describe('StorageService', () => {
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

  describe('getState', () => {
    it('should return null when no state exists', () => {
      const state = StorageService.getState();
      expect(state).toBeNull();
    });

    it('should return parsed state when it exists', () => {
      const savedState = {
        selectedDepartment: 'Math',
        departments: { Math: { categories: [], isCustomized: false } }
      };
      mockStorage['dppgc_state'] = JSON.stringify(savedState);

      const state = StorageService.getState();
      expect(state).toEqual(savedState);
    });

    it('should return null for invalid JSON', () => {
      mockStorage['dppgc_state'] = 'not valid json';

      const state = StorageService.getState();
      expect(state).toBeNull();
    });
  });

  describe('saveState', () => {
    it('should save state to localStorage', () => {
      const state = {
        selectedDepartment: 'English',
        departments: {}
      };

      StorageService.saveState(state);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'dppgc_state',
        JSON.stringify(state)
      );
    });
  });

  describe('getDepartmentState', () => {
    it('should return null when no state exists', () => {
      const deptState = StorageService.getDepartmentState('English');
      expect(deptState).toBeNull();
    });

    it('should return department state when it exists', () => {
      const savedState = {
        selectedDepartment: 'English',
        departments: {
          English: { categories: [{ id: 'test' }], isCustomized: true }
        }
      };
      mockStorage['dppgc_state'] = JSON.stringify(savedState);

      const deptState = StorageService.getDepartmentState('English');
      expect(deptState).toEqual(savedState.departments.English);
    });

    it('should return null for department not in state', () => {
      const savedState = {
        selectedDepartment: 'English',
        departments: {}
      };
      mockStorage['dppgc_state'] = JSON.stringify(savedState);

      const deptState = StorageService.getDepartmentState('Math');
      expect(deptState).toBeNull();
    });
  });

  describe('saveDepartmentState', () => {
    it('should create new state if none exists', () => {
      const deptData = { categories: [{ id: 'cat1' }], isCustomized: false };

      StorageService.saveDepartmentState('English', deptData);

      const savedState = JSON.parse(mockStorage['dppgc_state']);
      expect(savedState.departments.English).toEqual(deptData);
    });

    it('should update existing department state', () => {
      const existingState = {
        selectedDepartment: 'Math',
        departments: {
          Math: { categories: [], isCustomized: false }
        }
      };
      mockStorage['dppgc_state'] = JSON.stringify(existingState);

      const newDeptData = { categories: [{ id: 'new' }], isCustomized: true };
      StorageService.saveDepartmentState('English', newDeptData);

      const savedState = JSON.parse(mockStorage['dppgc_state']);
      expect(savedState.departments.English).toEqual(newDeptData);
      expect(savedState.departments.Math).toEqual(existingState.departments.Math);
    });
  });

  describe('clearDepartmentState', () => {
    it('should remove department from state', () => {
      const existingState = {
        selectedDepartment: 'English',
        departments: {
          English: { categories: [], isCustomized: true },
          Math: { categories: [], isCustomized: false }
        }
      };
      mockStorage['dppgc_state'] = JSON.stringify(existingState);

      StorageService.clearDepartmentState('English');

      const savedState = JSON.parse(mockStorage['dppgc_state']);
      expect(savedState.departments.English).toBeUndefined();
      expect(savedState.departments.Math).toBeDefined();
    });
  });

  describe('getSelectedDepartment', () => {
    it('should return null when no state exists', () => {
      expect(StorageService.getSelectedDepartment()).toBeNull();
    });

    it('should return selected department', () => {
      mockStorage['dppgc_state'] = JSON.stringify({
        selectedDepartment: 'Science',
        departments: {}
      });

      expect(StorageService.getSelectedDepartment()).toBe('Science');
    });
  });

  describe('setSelectedDepartment', () => {
    it('should save selected department', () => {
      StorageService.setSelectedDepartment('Maker');

      const savedState = JSON.parse(mockStorage['dppgc_state']);
      expect(savedState.selectedDepartment).toBe('Maker');
    });
  });

  describe('clearAll', () => {
    it('should remove all state', () => {
      mockStorage['dppgc_state'] = JSON.stringify({ data: 'test' });

      StorageService.clearAll();

      expect(localStorage.removeItem).toHaveBeenCalledWith('dppgc_state');
    });
  });
});
