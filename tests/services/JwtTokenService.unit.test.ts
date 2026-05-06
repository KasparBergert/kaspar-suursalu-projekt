import { describe, expect, it } from 'vitest';
import { JwtTokenService } from '../../server/services/JwtTokenService.ts';

const user = {
    id: 'user-1',
    name: 'Kaspar',
    email: 'kaspar@example.com',
};

describe('JwtTokenService', () => {
    it('validates a token it created', async () => {
        const tokenService = new JwtTokenService('secret');

        const token = await tokenService.create(user);
        const result = await tokenService.validate(token);

        expect(result).toEqual(user);
    });

    it('rejects a token that was created with another secret', async () => {
        const token = await new JwtTokenService('secret').create(user);

        await expect(new JwtTokenService('other-secret').validate(token)).rejects.toThrow();
    });

    it('rejects a token after it has been reset', async () => {
        const tokenService = new JwtTokenService('secret');
        const token = await tokenService.create(user);

        await tokenService.reset(token);

        await expect(tokenService.validate(token)).rejects.toThrow('Token has been reset.');
    });
});
