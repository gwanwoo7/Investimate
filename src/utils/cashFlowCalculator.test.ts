import { describe, it, expect } from 'vitest';
import { cashFlowCalculator } from './cashFlowCalculator';

describe('cashFlowCalculator', () => {
    it('calculates positive cash flow correctly', () => {
        const result = cashFlowCalculator(1000, 500);
        expect(result).toBe(500);
    });

    it('calculates negative cash flow correctly', () => {
        const result = cashFlowCalculator(500, 1000);
        expect(result).toBe(-500);
    });

    it('returns zero cash flow when income equals expenses', () => {
        const result = cashFlowCalculator(1000, 1000);
        expect(result).toBe(0);
    });
});