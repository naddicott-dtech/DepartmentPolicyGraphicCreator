/**
 * Generates a unique ID for category tree nodes
 * @returns {string} A unique alphanumeric ID
 */
export function generateId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}${random}`;
}
