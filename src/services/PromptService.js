/**
 * Service for generating Nano Banana Pro prompts and preview HTML
 */

import { escapeHtml } from '../utils/escapeHtml.js';
import { getLeafNodes } from '../utils/treeUtils.js';

export const PromptService = {
  /**
   * Generate the Nano Banana Pro prompt text
   * @param {string} department - Department name
   * @param {Array} categories - Category tree
   * @returns {string} Formatted prompt for AI image generation
   */
  generatePrompt(department, categories) {
    const { green, yellow, red } = this.getItemsByStatus(categories);

    const formatItems = (items) => {
      if (items.length === 0) return '  (none)\n';

      return items.map(item => {
        if (item.comment && item.comment.trim()) {
          return `  - ${item.label}: ${item.comment}`;
        }
        return `  - ${item.label}`;
      }).join('\n') + '\n';
    };

    return `Create a 16:9 infographic about AI usage policies for ${department} classes.
Use a clean, minimalist, flat vector style.
Colors: Vibrant Persimmon Orange (#E94E1B) for accents, white background, charcoal (#2D2D2D) text.
Typography: Modern geometric sans-serif (Roboto style), bold headings.

Title: "AI in ${department}: What's OK?"

Sections:

✓ GREEN (Go Ahead):
${formatItems(green)}
⚠ YELLOW (Ask First):
${formatItems(yellow)}
✗ RED (Not Allowed):
${formatItems(red)}
Layout: Vertical poster format with traffic light color coding.
Each section has a colored header (green/yellow/red) with white text.
Include simple flat icons for each section.
Clean typography, readable from 10 feet away.
Aesthetic: Academic yet innovative, Silicon Valley tech aesthetic, high contrast.
No gradients, no drop shadows, purely flat design.
Target resolution: 4K for large format printing.`;
  },

  /**
   * Generate preview HTML for the poster
   * @param {string} department - Department name
   * @param {Array} categories - Category tree
   * @returns {string} HTML string for preview
   */
  generatePreviewHtml(department, categories) {
    const { green, yellow, red } = this.getItemsByStatus(categories);

    const renderSection = (title, items, colorClass) => {
      if (items.length === 0) return '';

      const itemsHtml = items.map(item => {
        const label = escapeHtml(item.label);
        const comment = item.comment && item.comment.trim()
          ? `<span class="preview-comment"> — ${escapeHtml(item.comment)}</span>`
          : '';
        return `<li>${label}${comment}</li>`;
      }).join('\n        ');

      return `
    <div class="preview-section">
      <h3 class="preview-section-title ${colorClass}">${title}</h3>
      <ul class="preview-items">
        ${itemsHtml}
      </ul>
    </div>`;
    };

    return `
  <h2 class="preview-title">AI in ${escapeHtml(department)}: What's OK?</h2>
  ${renderSection('✓ Go Ahead', green, 'green')}
  ${renderSection('⚠ Ask First', yellow, 'yellow')}
  ${renderSection('✗ Not Allowed', red, 'red')}
`.trim();
  },

  /**
   * Get all leaf items grouped by status
   * @param {Array} categories - Category tree
   * @returns {{green: Array, yellow: Array, red: Array}} Items by status
   */
  getItemsByStatus(categories) {
    const leaves = getLeafNodes(categories);

    return {
      green: leaves.filter(item => item.status === 'green'),
      yellow: leaves.filter(item => item.status === 'yellow'),
      red: leaves.filter(item => item.status === 'red')
    };
  }
};
