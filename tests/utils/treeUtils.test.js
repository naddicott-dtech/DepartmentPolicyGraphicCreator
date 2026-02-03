import {
  findNodeById,
  getLeafNodes,
  getNodeDepth,
  cloneTree,
  validateTree
} from '../../src/utils/treeUtils.js';

describe('treeUtils', () => {
  const sampleTree = [
    {
      id: 'cat1',
      label: 'Category 1',
      status: null,
      comment: '',
      children: [
        { id: 'item1', label: 'Item 1', status: 'green', comment: 'Note 1', children: [] },
        { id: 'item2', label: 'Item 2', status: 'red', comment: '', children: [] }
      ]
    },
    {
      id: 'flat1',
      label: 'Flat Item',
      status: 'yellow',
      comment: '',
      children: []
    }
  ];

  describe('findNodeById', () => {
    it('should find a top-level node', () => {
      const node = findNodeById(sampleTree, 'cat1');
      expect(node).not.toBeNull();
      expect(node.label).toBe('Category 1');
    });

    it('should find a nested node', () => {
      const node = findNodeById(sampleTree, 'item1');
      expect(node).not.toBeNull();
      expect(node.label).toBe('Item 1');
    });

    it('should return null for non-existent ID', () => {
      const node = findNodeById(sampleTree, 'nonexistent');
      expect(node).toBeNull();
    });

    it('should handle empty tree', () => {
      const node = findNodeById([], 'any');
      expect(node).toBeNull();
    });
  });

  describe('getLeafNodes', () => {
    it('should return all leaf nodes', () => {
      const leaves = getLeafNodes(sampleTree);
      expect(leaves).toHaveLength(3);
      expect(leaves.map(n => n.id)).toEqual(['item1', 'item2', 'flat1']);
    });

    it('should return empty array for empty tree', () => {
      const leaves = getLeafNodes([]);
      expect(leaves).toHaveLength(0);
    });

    it('should handle tree with only parents (no leaves)', () => {
      const tree = [
        { id: 'p1', label: 'Parent', children: [] }
      ];
      const leaves = getLeafNodes(tree);
      // A node with empty children IS a leaf
      expect(leaves).toHaveLength(1);
    });
  });

  describe('getNodeDepth', () => {
    it('should return 1 for top-level nodes', () => {
      expect(getNodeDepth(sampleTree, 'cat1')).toBe(1);
      expect(getNodeDepth(sampleTree, 'flat1')).toBe(1);
    });

    it('should return 2 for second-level nodes', () => {
      expect(getNodeDepth(sampleTree, 'item1')).toBe(2);
    });

    it('should return -1 for non-existent nodes', () => {
      expect(getNodeDepth(sampleTree, 'nonexistent')).toBe(-1);
    });
  });

  describe('cloneTree', () => {
    it('should create a deep copy', () => {
      const clone = cloneTree(sampleTree);

      // Should be equal in value
      expect(clone).toEqual(sampleTree);

      // Should not be the same reference
      expect(clone).not.toBe(sampleTree);
      expect(clone[0]).not.toBe(sampleTree[0]);
      expect(clone[0].children[0]).not.toBe(sampleTree[0].children[0]);
    });

    it('should handle empty tree', () => {
      const clone = cloneTree([]);
      expect(clone).toEqual([]);
    });
  });

  describe('validateTree', () => {
    it('should pass for valid tree', () => {
      const result = validateTree(sampleTree);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail for node without id', () => {
      const badTree = [{ label: 'No ID', children: [] }];
      const result = validateTree(badTree);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Node missing required id field');
    });

    it('should fail for node without label', () => {
      const badTree = [{ id: 'nolabel', children: [] }];
      const result = validateTree(badTree);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Node missing required label field');
    });

    it('should fail for empty label', () => {
      const badTree = [{ id: 'empty', label: '', children: [] }];
      const result = validateTree(badTree);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Node label cannot be empty');
    });

    it('should fail for duplicate IDs', () => {
      const badTree = [
        { id: 'dup', label: 'First', children: [] },
        { id: 'dup', label: 'Second', children: [] }
      ];
      const result = validateTree(badTree);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Duplicate'))).toBe(true);
    });

    it('should fail for depth exceeding 3', () => {
      const deepTree = [{
        id: 'l1', label: 'Level 1', children: [{
          id: 'l2', label: 'Level 2', children: [{
            id: 'l3', label: 'Level 3', children: [{
              id: 'l4', label: 'Level 4 - too deep', children: []
            }]
          }]
        }]
      }];
      const result = validateTree(deepTree);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('depth'))).toBe(true);
    });
  });
});
