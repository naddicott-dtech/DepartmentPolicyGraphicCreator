/**
 * Prompt output component - displays generated prompt with copy button
 */

import { PromptService } from '../services/PromptService.js';
import { escapeHtml } from '../utils/escapeHtml.js';

export const PromptOutput = {
  /**
   * Render the prompt output section
   * @param {HTMLElement} container - Prompt container (the <pre> element)
   * @param {string} department - Selected department
   * @param {Array} categories - Category data
   */
  render(container, department, categories) {
    if (!department || !categories || categories.length === 0) {
      container.textContent = 'Select a department to generate prompt.';
      return;
    }

    const prompt = PromptService.generatePrompt(department, categories);
    container.textContent = prompt;
  },

  /**
   * Set up copy button functionality
   * @param {HTMLElement} button - Copy button
   * @param {HTMLElement} promptContainer - Container with prompt text
   */
  setupCopyButton(button, promptContainer) {
    button.addEventListener('click', async () => {
      const promptText = promptContainer.textContent;

      try {
        await navigator.clipboard.writeText(promptText);

        // Visual feedback
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        button.classList.add('copied');

        setTimeout(() => {
          button.textContent = originalText;
          button.classList.remove('copied');
        }, 2000);
      } catch (err) {
        console.error('Failed to copy:', err);

        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = promptText;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.select();

        try {
          document.execCommand('copy');
          button.textContent = 'Copied!';
          setTimeout(() => {
            button.textContent = 'Copy to Clipboard';
          }, 2000);
        } catch (fallbackErr) {
          console.error('Fallback copy failed:', fallbackErr);
          button.textContent = 'Copy failed';
          setTimeout(() => {
            button.textContent = 'Copy to Clipboard';
          }, 2000);
        }

        document.body.removeChild(textArea);
      }
    });
  }
};
