/**
 * Tree utility functions for category manipulation
 */

const MAX_DEPTH = 3;

/**
 * Finds a node by its ID in the tree
 * @param {Array} tree - The tree to search
 * @param {string} id - The ID to find
 * @returns {Object|null} The found node or null
 */
export function findNodeById(tree, id) {
  for (const node of tree) {
    if (node.id === id) return node;
    if (node.children && node.children.length > 0) {
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Gets all leaf nodes (nodes with no children or empty children array)
 * @param {Array} tree - The tree to traverse
 * @returns {Array} Array of leaf nodes
 */
export function getLeafNodes(tree) {
  const leaves = [];

  function traverse(nodes) {
    for (const node of nodes) {
      if (!node.children || node.children.length === 0) {
        leaves.push(node);
      } else {
        traverse(node.children);
      }
    }
  }

  traverse(tree);
  return leaves;
}

/**
 * Gets the depth of a node in the tree (1-indexed)
 * @param {Array} tree - The tree to search
 * @param {string} id - The ID to find
 * @param {number} currentDepth - Current depth (internal use)
 * @returns {number} The depth, or -1 if not found
 */
export function getNodeDepth(tree, id, currentDepth = 1) {
  for (const node of tree) {
    if (node.id === id) return currentDepth;
    if (node.children && node.children.length > 0) {
      const found = getNodeDepth(node.children, id, currentDepth + 1);
      if (found !== -1) return found;
    }
  }
  return -1;
}

/**
 * Creates a deep clone of the tree
 * @param {Array} tree - The tree to clone
 * @returns {Array} A deep copy of the tree
 */
export function cloneTree(tree) {
  return JSON.parse(JSON.stringify(tree));
}

/**
 * Validates a tree structure
 * @param {Array} tree - The tree to validate
 * @returns {{valid: boolean, errors: string[]}} Validation result
 */
export function validateTree(tree) {
  const errors = [];
  const seenIds = new Set();

  function validate(nodes, depth = 1) {
    for (const node of nodes) {
      // Check required fields
      if (!node.id) {
        errors.push('Node missing required id field');
      } else {
        // Check for duplicates
        if (seenIds.has(node.id)) {
          errors.push(`Duplicate id found: ${node.id}`);
        }
        seenIds.add(node.id);
      }

      if (node.label === undefined || node.label === null) {
        errors.push('Node missing required label field');
      } else if (node.label.trim() === '') {
        errors.push('Node label cannot be empty');
      }

      // Check depth
      if (depth > MAX_DEPTH) {
        errors.push(`Maximum depth exceeded (${MAX_DEPTH} levels allowed)`);
      }

      // Recurse into children
      if (node.children && node.children.length > 0) {
        validate(node.children, depth + 1);
      }
    }
  }

  validate(tree);

  return {
    valid: errors.length === 0,
    errors
  };
}
