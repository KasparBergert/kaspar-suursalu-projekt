import { computed } from 'vue';
import { useAppRouter } from '../router.ts';
import { useAuth } from '../features/auth/composables/useAuth.ts';
import { useSession } from '../features/auth/composables/useSession.ts';
import { useNotice } from '../shared/composables/useNotice.ts';
import { useAuthPage } from '../shared/composables/useAuthPage.ts';
import type { AuthPageModel } from '../types.ts';

let authStore: ReturnType<typeof createAuthStore> | null = null;

export function useAuthStore() {
    authStore ??= createAuthStore();
    return authStore;
}

function createAuthStore() {
    const notice = useNotice();
    const session = useSession();
    const authPage = useAuthPage();
    const auth = useAuth(session, notice);
    const router = useAppRouter();
    const isSubmitting = computed(() => auth.isSubmitting.value);
    const isAuthPageVisible = computed(() => router.isAuthRoute.value && !session.isAuthenticated.value);
    const authPageModel = computed<AuthPageModel>(() => ({
        errorMessage: notice.errorMessage.value,
        isSubmitting: isSubmitting.value,
        message: notice.message.value,
        mode: authPage.mode.value,
    }));

    async function submitAuth(payload: Parameters<typeof auth.submitAuth>[0]): Promise<void> {
        const didSubmit = await auth.submitAuth(payload);

        if (didSubmit) {
            authPage.close();
            router.goTo('feed');
        }
    }

    function openLoginPage(): void {
        showLoginPage();
        authPage.openLogin();
        router.goTo('auth');
    }

    function showLoginPage(): void {
        auth.switchAuthMode('login');
        authPage.showLogin();
    }

    function showRegisterPage(): void {
        auth.switchAuthMode('register');
        authPage.showRegister();
    }

    function openResetPasswordForm(): void {
        authPage.openResetPassword();
    }

    return {
        authPage,
        authPageModel,
        isAuthPageVisible,
        isSubmitting,
        loadProfile: auth.loadProfile,
        logout: auth.logout,
        notice,
        openLoginPage,
        openResetPasswordForm,
        session,
        showLoginPage,
        showRegisterPage,
        submitAuth,
        toggleForgotPassword: authPage.toggleForgotPassword,
    };
}
