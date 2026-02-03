/**
 * Department selector navigation component
 */

import { DefaultsService } from '../services/DefaultsService.js';
import { escapeHtml } from '../utils/escapeHtml.js';

export const DepartmentSelector = {
  /**
   * Render department buttons
   * @param {HTMLElement} container - Nav container
   * @param {string|null} selectedDepartment - Currently selected department
   * @param {Function} onSelect - Callback when department is selected
   */
  render(container, selectedDepartment, onSelect) {
    const departments = DefaultsService.getDepartments();

    container.innerHTML = departments.map(dept => {
      const isSelected = dept === selectedDepartment;
      return `
        <button
          class="dept-btn"
          data-testid="dept-${dept.toLowerCase().replace(/\s+/g, '-')}"
          data-department="${escapeHtml(dept)}"
          aria-pressed="${isSelected}"
        >${escapeHtml(dept)}</button>
      `;
    }).join('');

    // Event delegation for department selection
    container.addEventListener('click', (e) => {
      const btn = e.target.closest('.dept-btn');
      if (btn) {
        const department = btn.dataset.department;
        onSelect(department);
      }
    });
  },

  /**
   * Update selected state without full re-render
   * @param {HTMLElement} container - Nav container
   * @param {string} selectedDepartment - Newly selected department
   */
  updateSelected(container, selectedDepartment) {
    const buttons = container.querySelectorAll('.dept-btn');
    buttons.forEach(btn => {
      const isSelected = btn.dataset.department === selectedDepartment;
      btn.setAttribute('aria-pressed', isSelected);
    });
  }
};
