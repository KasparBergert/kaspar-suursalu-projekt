import { describe, expect, it } from 'vitest';
import { JwtTokenService } from '../../server/services/JwtTokenService.ts';

describe('JwtTokenService integration', () => {
    it('creates a token that can be validated back into the user', async () => {
        const tokenService = new JwtTokenService('integration-secret');
        const user = {
            id: 'user-1',
            name: 'Integration User',
            email: 'integration@example.com',
        };

        const token = await tokenService.create(user);
        const result = await tokenService.validate(token);

        expect(result).toEqual(user);
    });
});
