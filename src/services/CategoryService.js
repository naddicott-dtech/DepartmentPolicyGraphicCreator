/**
 * Service for manipulating category trees
 */

import { generateId } from '../utils/generateId.js';
import { cloneTree, findNodeById, getNodeDepth } from '../utils/treeUtils.js';

const MAX_DEPTH = 3;

export const CategoryService = {
  /**
   * Add a new top-level category
   * @param {Array} categories - Current categories
   * @param {string} label - Name for the new category
   * @returns {{categories: Array}|{error: string}} Result or error
   */
  addCategory(categories, label) {
    const trimmedLabel = (label || '').trim();

    if (!trimmedLabel) {
      return { error: 'Category name cannot be empty' };
    }

    // Check for duplicates
    const exists = categories.some(
      cat => cat.label.toLowerCase() === trimmedLabel.toLowerCase()
    );
    if (exists) {
      return { error: 'A category with this name already exists' };
    }

    const newCategories = cloneTree(categories);
    newCategories.push({
      id: generateId(),
      label: trimmedLabel,
      status: null, // Parent categories always have null status
      comment: '',
      children: []
    });

    return { categories: newCategories };
  },

  /**
   * Add a new item under a parent
   * @param {Array} categories - Current categories
   * @param {string} parentId - ID of parent node
   * @param {string} label - Name for the new item
   * @returns {{categories: Array}|{error: string}} Result or error
   */
  addItem(categories, parentId, label) {
    const trimmedLabel = (label || '').trim();

    if (!trimmedLabel) {
      return { error: 'Category name cannot be empty' };
    }

    const newCategories = cloneTree(categories);
    const parent = findNodeById(newCategories, parentId);

    if (!parent) {
      return { error: 'Parent category not found' };
    }

    // Check depth
    const parentDepth = getNodeDepth(newCategories, parentId);
    if (parentDepth >= MAX_DEPTH) {
      return { error: 'Maximum depth reached (3 levels)' };
    }

    parent.children.push({
      id: generateId(),
      label: trimmedLabel,
      status: 'red', // New items default to red
      comment: '',
      children: []
    });

    // Parent now has children, ensure status is null
    parent.status = null;

    return { categories: newCategories };
  },

  /**
   * Rename a node
   * @param {Array} categories - Current categories
   * @param {string} nodeId - ID of node to rename
   * @param {string} newLabel - New name
   * @returns {{categories: Array}|{error: string}} Result or error
   */
  renameNode(categories, nodeId, newLabel) {
    const trimmedLabel = (newLabel || '').trim();

    if (!trimmedLabel) {
      return { error: 'Category name cannot be empty' };
    }

    const newCategories = cloneTree(categories);
    const node = findNodeById(newCategories, nodeId);

    if (!node) {
      return { error: 'Node not found' };
    }

    node.label = trimmedLabel;
    return { categories: newCategories };
  },

  /**
   * Delete a node (recursive - includes all children)
   * @param {Array} categories - Current categories
   * @param {string} nodeId - ID of node to delete
   * @returns {{categories: Array}|{error: string}} Result or error
   */
  deleteNode(categories, nodeId) {
    const newCategories = cloneTree(categories);

    function deleteFromArray(nodes) {
      const index = nodes.findIndex(n => n.id === nodeId);
      if (index !== -1) {
        nodes.splice(index, 1);
        return true;
      }

      for (const node of nodes) {
        if (node.children && deleteFromArray(node.children)) {
          return true;
        }
      }

      return false;
    }

    const deleted = deleteFromArray(newCategories);

    if (!deleted) {
      return { error: 'Node not found' };
    }

    return { categories: newCategories };
  },

  /**
   * Move a node up or down within its siblings
   * @param {Array} categories - Current categories
   * @param {string} nodeId - ID of node to move
   * @param {string} direction - 'up' or 'down'
   * @returns {{categories: Array}} Result
   */
  moveNode(categories, nodeId, direction) {
    const newCategories = cloneTree(categories);

    function findAndMove(nodes) {
      const index = nodes.findIndex(n => n.id === nodeId);

      if (index !== -1) {
        const newIndex = direction === 'up' ? index - 1 : index + 1;

        if (newIndex >= 0 && newIndex < nodes.length) {
          const [node] = nodes.splice(index, 1);
          nodes.splice(newIndex, 0, node);
        }
        return true;
      }

      for (const node of nodes) {
        if (node.children && findAndMove(node.children)) {
          return true;
        }
      }

      return false;
    }

    findAndMove(newCategories);
    return { categories: newCategories };
  },

  /**
   * Set status on a leaf node
   * @param {Array} categories - Current categories
   * @param {string} nodeId - ID of node
   * @param {string} status - 'green', 'yellow', or 'red'
   * @returns {{categories: Array}|{error: string}} Result or error
   */
  setStatus(categories, nodeId, status) {
    const newCategories = cloneTree(categories);
    const node = findNodeById(newCategories, nodeId);

    if (!node) {
      return { error: 'Node not found' };
    }

    if (node.children && node.children.length > 0) {
      return { error: 'Cannot set status on category with children' };
    }

    node.status = status;
    return { categories: newCategories };
  },

  /**
   * Set comment on any node
   * @param {Array} categories - Current categories
   * @param {string} nodeId - ID of node
   * @param {string} comment - Comment text
   * @returns {{categories: Array}|{error: string}} Result or error
   */
  setComment(categories, nodeId, comment) {
    const newCategories = cloneTree(categories);
    const node = findNodeById(newCategories, nodeId);

    if (!node) {
      return { error: 'Node not found' };
    }

    node.comment = comment;
    return { categories: newCategories };
  },

  /**
   * Reset all statuses to red and clear all comments
   * @param {Array} categories - Categories to reset
   * @returns {Array} Reset categories
   */
  resetToDefaults(categories) {
    const newCategories = cloneTree(categories);

    function reset(nodes) {
      for (const node of nodes) {
        node.comment = '';

        if (node.children && node.children.length > 0) {
          node.status = null;
          reset(node.children);
        } else {
          node.status = 'red';
        }
      }
    }

    reset(newCategories);
    return newCategories;
  }
};
