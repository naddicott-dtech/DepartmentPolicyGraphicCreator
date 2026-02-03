/**
 * Preview component - shows poster preview
 */

import { PromptService } from '../services/PromptService.js';

export const Preview = {
  /**
   * Render the preview panel
   * @param {HTMLElement} container - Preview container
   * @param {string} department - Selected department
   * @param {Array} categories - Category data
   */
  render(container, department, categories) {
    if (!department || !categories || categories.length === 0) {
      container.innerHTML = `
        <div class="preview-empty">
          <p>Select a department and configure policies to see preview.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = PromptService.generatePreviewHtml(department, categories);
  }
};
