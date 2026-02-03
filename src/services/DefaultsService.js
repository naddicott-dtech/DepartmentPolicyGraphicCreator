/**
 * Service for loading default category configurations per department
 */

import englishDefaults from '../data/defaults/english.json' with { type: 'json' };
import mathDefaults from '../data/defaults/math.json' with { type: 'json' };
import scienceDefaults from '../data/defaults/science.json' with { type: 'json' };
import socialStudiesDefaults from '../data/defaults/social-studies.json' with { type: 'json' };
import makerDefaults from '../data/defaults/maker.json' with { type: 'json' };
import foreignLanguageDefaults from '../data/defaults/foreign-language.json' with { type: 'json' };

const DEPARTMENTS = [
  'English',
  'Math',
  'Science',
  'Social Studies',
  'Maker',
  'Foreign Language'
];

const DEFAULTS_MAP = {
  'English': englishDefaults,
  'Math': mathDefaults,
  'Science': scienceDefaults,
  'Social Studies': socialStudiesDefaults,
  'Maker': makerDefaults,
  'Foreign Language': foreignLanguageDefaults
};

export const DefaultsService = {
  /**
   * Get list of all available departments
   * @returns {string[]} Array of department names
   */
  getDepartments() {
    return [...DEPARTMENTS];
  },

  /**
   * Get default categories for a department
   * @param {string} department - The department name
   * @returns {Object} Deep copy of default categories
   * @throws {Error} If department is not found
   */
  getDefaultCategories(department) {
    const defaults = DEFAULTS_MAP[department];

    if (!defaults) {
      throw new Error(`Unknown department: ${department}`);
    }

    // Return deep copy to prevent mutations
    return JSON.parse(JSON.stringify(defaults));
  }
};
