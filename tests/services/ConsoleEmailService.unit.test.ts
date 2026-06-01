import { afterEach, describe, expect, it, vi } from 'vitest';
import { ConsoleEmailService } from '../../server/services/ConsoleEmailService.ts';

describe('ConsoleEmailService', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('prints the password reset URL with its token to the server console', async () => {
        const log = vi.spyOn(console, 'log').mockImplementation(() => {});

        await new ConsoleEmailService().sendPasswordReset(
            'kaspar@example.com',
            'http://127.0.0.1:5173/?resetToken=reset-token-123',
        );

        expect(log).toHaveBeenCalledWith(
            'Password reset email for kaspar@example.com: http://127.0.0.1:5173/?resetToken=reset-token-123',
        );
    });
});
