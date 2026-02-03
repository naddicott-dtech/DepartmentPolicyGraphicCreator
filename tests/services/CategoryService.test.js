import { CategoryService } from '../../src/services/CategoryService.js';

describe('CategoryService', () => {
  let sampleCategories;

  beforeEach(() => {
    sampleCategories = [
      {
        id: 'cat1',
        label: 'Category 1',
        status: null,
        comment: '',
        children: [
          { id: 'item1', label: 'Item 1', status: 'green', comment: 'Note', children: [] },
          { id: 'item2', label: 'Item 2', status: 'red', comment: '', children: [] }
        ]
      },
      {
        id: 'cat2',
        label: 'Category 2',
        status: null,
        comment: '',
        children: []
      }
    ];
  });

  describe('addCategory', () => {
    it('should add a new top-level category', () => {
      const result = CategoryService.addCategory(sampleCategories, 'New Category');

      expect(result.categories).toHaveLength(3);
      expect(result.categories[2].label).toBe('New Category');
      expect(result.categories[2].id).toBeTruthy();
      expect(result.categories[2].status).toBeNull();
      expect(result.categories[2].children).toEqual([]);
    });

    it('should return error for empty label', () => {
      const result = CategoryService.addCategory(sampleCategories, '');

      expect(result.error).toBe('Category name cannot be empty');
    });

    it('should return error for duplicate label', () => {
      const result = CategoryService.addCategory(sampleCategories, 'Category 1');

      expect(result.error).toBe('A category with this name already exists');
    });
  });

  describe('addItem', () => {
    it('should add item under a category', () => {
      const result = CategoryService.addItem(sampleCategories, 'cat1', 'New Item');

      expect(result.categories[0].children).toHaveLength(3);
      expect(result.categories[0].children[2].label).toBe('New Item');
      expect(result.categories[0].children[2].status).toBe('red'); // default
    });

    it('should return error for max depth exceeded', () => {
      // Add child to item1 (which would be level 3, adding child would be level 4)
      const deepTree = [{
        id: 'l1', label: 'L1', status: null, comment: '', children: [{
          id: 'l2', label: 'L2', status: null, comment: '', children: [{
            id: 'l3', label: 'L3', status: 'red', comment: '', children: []
          }]
        }]
      }];

      const result = CategoryService.addItem(deepTree, 'l3', 'Too Deep');

      expect(result.error).toBe('Maximum depth reached (3 levels)');
    });

    it('should return error for non-existent parent', () => {
      const result = CategoryService.addItem(sampleCategories, 'nonexistent', 'Item');

      expect(result.error).toBe('Parent category not found');
    });
  });

  describe('renameNode', () => {
    it('should rename a category', () => {
      const result = CategoryService.renameNode(sampleCategories, 'cat1', 'Renamed Category');

      expect(result.categories[0].label).toBe('Renamed Category');
    });

    it('should rename an item', () => {
      const result = CategoryService.renameNode(sampleCategories, 'item1', 'Renamed Item');

      expect(result.categories[0].children[0].label).toBe('Renamed Item');
    });

    it('should return error for empty name', () => {
      const result = CategoryService.renameNode(sampleCategories, 'cat1', '  ');

      expect(result.error).toBe('Category name cannot be empty');
    });
  });

  describe('deleteNode', () => {
    it('should delete a category and its children', () => {
      const result = CategoryService.deleteNode(sampleCategories, 'cat1');

      expect(result.categories).toHaveLength(1);
      expect(result.categories[0].id).toBe('cat2');
    });

    it('should delete an item', () => {
      const result = CategoryService.deleteNode(sampleCategories, 'item1');

      expect(result.categories[0].children).toHaveLength(1);
      expect(result.categories[0].children[0].id).toBe('item2');
    });

    it('should return error for non-existent node', () => {
      const result = CategoryService.deleteNode(sampleCategories, 'nonexistent');

      expect(result.error).toBe('Node not found');
    });
  });

  describe('moveNode', () => {
    it('should move item up', () => {
      const result = CategoryService.moveNode(sampleCategories, 'item2', 'up');

      expect(result.categories[0].children[0].id).toBe('item2');
      expect(result.categories[0].children[1].id).toBe('item1');
    });

    it('should move item down', () => {
      const result = CategoryService.moveNode(sampleCategories, 'item1', 'down');

      expect(result.categories[0].children[0].id).toBe('item2');
      expect(result.categories[0].children[1].id).toBe('item1');
    });

    it('should not move first item up', () => {
      const result = CategoryService.moveNode(sampleCategories, 'item1', 'up');

      expect(result.categories[0].children[0].id).toBe('item1'); // unchanged
    });

    it('should not move last item down', () => {
      const result = CategoryService.moveNode(sampleCategories, 'item2', 'down');

      expect(result.categories[0].children[1].id).toBe('item2'); // unchanged
    });
  });

  describe('setStatus', () => {
    it('should set status on a leaf node', () => {
      const result = CategoryService.setStatus(sampleCategories, 'item1', 'yellow');

      expect(result.categories[0].children[0].status).toBe('yellow');
    });

    it('should not set status on parent with children', () => {
      const result = CategoryService.setStatus(sampleCategories, 'cat1', 'green');

      expect(result.error).toBe('Cannot set status on category with children');
    });
  });

  describe('setComment', () => {
    it('should set comment on any node', () => {
      const result = CategoryService.setComment(sampleCategories, 'item1', 'New comment');

      expect(result.categories[0].children[0].comment).toBe('New comment');
    });

    it('should allow empty comment', () => {
      const result = CategoryService.setComment(sampleCategories, 'item1', '');

      expect(result.categories[0].children[0].comment).toBe('');
    });
  });

  describe('resetToDefaults', () => {
    it('should reset all statuses to red and clear comments', () => {
      const result = CategoryService.resetToDefaults(sampleCategories);

      // Check leaf items are reset to red with empty comments
      expect(result[0].children[0].status).toBe('red');
      expect(result[0].children[0].comment).toBe('');
      expect(result[0].children[1].status).toBe('red');
    });

    it('should preserve parent status as null', () => {
      const result = CategoryService.resetToDefaults(sampleCategories);

      expect(result[0].status).toBeNull();
    });
  });
});
