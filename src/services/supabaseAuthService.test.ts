import { describe, it, expect } from 'vitest';
import { supabaseAuthService } from './supabaseAuthService';

describe('supabaseAuthService', () => {
    it('should authenticate a user', async () => {
        const response = await supabaseAuthService.authenticate('test@example.com', 'password');
        expect(response).toHaveProperty('user');
    });

    it('should sign out a user', async () => {
        const response = await supabaseAuthService.signOut();
        expect(response).toHaveProperty('error', null);
    });
});