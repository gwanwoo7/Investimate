import { describe, it, expect } from 'vitest';
import { someFunction } from '../realEstateService';

describe('realEstateService', () => {
    it('should return expected result from someFunction', () => {
        const result = someFunction();
        expect(result).toEqual('expected result');
    });
});