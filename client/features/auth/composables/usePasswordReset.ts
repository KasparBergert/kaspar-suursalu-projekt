import * as authApi from '../services/authApi.ts';
import type { useNotice } from '../../../shared/composables/useNotice.ts';

type Notice = ReturnType<typeof useNotice>;

export function usePasswordReset(notice: Notice) {
    async function requestPasswordReset(email: string): Promise<boolean> {
        notice.clearNotice();

        try {
            const result = await authApi.requestPasswordReset({ email });
            notice.showMessage(result.message);
            return true;
        } catch (error) {
            notice.showError(error);
            return false;
        }
    }

    async function verifyPasswordResetToken(token: string): Promise<boolean> {
        notice.clearNotice();

        try {
            await authApi.verifyPasswordResetToken(token);
            return true;
        } catch (error) {
            notice.showError(error);
            return false;
        }
    }

    async function verifyCurrentPasswordReset(): Promise<boolean> {
        notice.clearNotice();

        try {
            await authApi.verifyCurrentPasswordReset();
            return true;
        } catch (error) {
            notice.showError(error);
            return false;
        }
    }

    async function resetPassword(password: string): Promise<boolean> {
        notice.clearNotice();

        try {
            const result = await authApi.resetPassword({ password });
            notice.showMessage(result.message);
            return true;
        } catch (error) {
            notice.showError(error);
            return false;
        }
    }

    return {
        requestPasswordReset,
        resetPassword,
        verifyCurrentPasswordReset,
        verifyPasswordResetToken,
    };
}
