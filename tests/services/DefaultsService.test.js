import { DefaultsService } from '../../src/services/DefaultsService.js';

describe('DefaultsService', () => {
  describe('getDepartments', () => {
    it('should return all 6 departments', () => {
      const departments = DefaultsService.getDepartments();
      expect(departments).toHaveLength(6);
      expect(departments).toContain('English');
      expect(departments).toContain('Math');
      expect(departments).toContain('Science');
      expect(departments).toContain('Social Studies');
      expect(departments).toContain('Maker');
      expect(departments).toContain('Foreign Language');
    });
  });

  describe('getDefaultCategories', () => {
    it('should return categories for English', () => {
      const data = DefaultsService.getDefaultCategories('English');
      expect(data.department).toBe('English');
      expect(data.categories).toHaveLength(3);
      expect(data.categories[0].label).toBe('UNDERSTANDING');
    });

    it('should return categories for Math', () => {
      const data = DefaultsService.getDefaultCategories('Math');
      expect(data.department).toBe('Math');
      expect(data.categories).toHaveLength(3);
    });

    it('should return categories for Science', () => {
      const data = DefaultsService.getDefaultCategories('Science');
      expect(data.department).toBe('Science');
      expect(data.categories).toHaveLength(3);
    });

    it('should return categories for Social Studies', () => {
      const data = DefaultsService.getDefaultCategories('Social Studies');
      expect(data.department).toBe('Social Studies');
      expect(data.categories).toHaveLength(3);
    });

    it('should return categories for Maker', () => {
      const data = DefaultsService.getDefaultCategories('Maker');
      expect(data.department).toBe('Maker');
      expect(data.categories).toHaveLength(3);
    });

    it('should return categories for Foreign Language', () => {
      const data = DefaultsService.getDefaultCategories('Foreign Language');
      expect(data.department).toBe('Foreign Language');
      expect(data.categories).toHaveLength(3);
    });

    it('should throw error for invalid department', () => {
      expect(() => DefaultsService.getDefaultCategories('Invalid')).toThrow();
    });

    it('should return deep copy (not reference)', () => {
      const data1 = DefaultsService.getDefaultCategories('English');
      const data2 = DefaultsService.getDefaultCategories('English');

      data1.categories[0].label = 'MODIFIED';

      expect(data2.categories[0].label).toBe('UNDERSTANDING');
    });
  });

  describe('category structure', () => {
    it('should have valid tree structure for all departments', () => {
      const departments = DefaultsService.getDepartments();

      for (const dept of departments) {
        const data = DefaultsService.getDefaultCategories(dept);

        for (const category of data.categories) {
          expect(category.id).toBeTruthy();
          expect(category.label).toBeTruthy();
          expect(category.status).toBeNull(); // Parents have null status
          expect(Array.isArray(category.children)).toBe(true);

          for (const item of category.children) {
            expect(item.id).toBeTruthy();
            expect(item.label).toBeTruthy();
            expect(['green', 'yellow', 'red']).toContain(item.status);
            expect(item.children).toEqual([]);
          }
        }
      }
    });
  });
});
