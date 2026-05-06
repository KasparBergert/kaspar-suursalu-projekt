import { ref } from 'vue';
import type { createApiClient } from '../../../services/apiClient.ts';
import type { AuthCredentials, AuthMode, RegisterPayload } from '../../../types.ts';
import type { useNotice } from '../../../shared/composables/useNotice.ts';
import type { useSession } from './useSession.ts';

type ApiClient = ReturnType<typeof createApiClient>;
type Notice = ReturnType<typeof useNotice>;
type Session = ReturnType<typeof useSession>;

export function useAuth(api: ApiClient, session: Session, notice: Notice) {
    const authMode = ref<AuthMode>('login');
    const isSubmitting = ref(false);

    async function loadProfile(): Promise<void> {
        try {
            const result = await api.getProfile();
            session.updateUser(result.user);
        } catch {
            session.clearSession();
        }
    }

    async function submitAuth(payload: RegisterPayload | AuthCredentials): Promise<boolean> {
        isSubmitting.value = true;
        notice.clearNotice();

        try {
            const result = authMode.value === 'login'
                ? await api.login(payload)
                : await api.register(payload as RegisterPayload);

            session.setSession(result.token, result.user);
            notice.showMessage(`Welcome, ${result.user.name}.`);
            return true;
        } catch (error) {
            notice.showError(error);
            return false;
        } finally {
            isSubmitting.value = false;
        }
    }

    async function logout(): Promise<void> {
        if (!session.token.value) {
            session.clearSession();
            return;
        }

        isSubmitting.value = true;
        notice.clearNotice();

        try {
            await api.logout();
            notice.showMessage('Logged out.');
        } catch (error) {
            notice.showError(error);
        } finally {
            session.clearSession();
            isSubmitting.value = false;
        }
    }

    function switchAuthMode(nextMode: AuthMode): void {
        authMode.value = nextMode;
        notice.clearNotice();
    }

    return {
        authMode,
        isSubmitting,
        loadProfile,
        logout,
        submitAuth,
        switchAuthMode,
    };
}
