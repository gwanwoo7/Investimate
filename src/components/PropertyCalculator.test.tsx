import { describe, it, expect } from 'vitest';
import PropertyCalculator from '../PropertyCalculator';

describe('PropertyCalculator', () => {
  it('should calculate property value correctly', () => {
    const result = PropertyCalculator.calculateValue(100000, 0.05);
    expect(result).toBe(105000);
  });

  it('should handle invalid inputs', () => {
    expect(() => PropertyCalculator.calculateValue(-100000, 0.05)).toThrow();
  });
});