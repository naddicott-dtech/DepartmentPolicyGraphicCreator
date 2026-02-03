/**
 * Smoke test to verify Jest is configured correctly
 */

describe('Jest Setup', () => {
  it('should run tests', () => {
    expect(true).toBe(true);
  });

  it('should support basic assertions', () => {
    expect(1 + 1).toBe(2);
    expect([1, 2, 3]).toHaveLength(3);
  });
});
