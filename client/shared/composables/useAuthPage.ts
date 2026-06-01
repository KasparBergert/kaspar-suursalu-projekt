import { ref } from 'vue';
import type { AuthPageMode } from '../../types.ts';

export function useAuthPage() {
    const isVisible = ref(false);
    const mode = ref<AuthPageMode>('login');
    const passwordResetToken = ref('');

    function openLogin(): void {
        mode.value = 'login';
        isVisible.value = true;
    }

    function openRegister(): void {
        mode.value = 'register';
        isVisible.value = true;
    }

    function openResetPassword(resetToken: string): void {
        passwordResetToken.value = resetToken;
        mode.value = 'reset-password';
        isVisible.value = true;
    }

    function showLogin(): void {
        mode.value = 'login';
    }

    function showRegister(): void {
        mode.value = 'register';
    }

    function toggleForgotPassword(): void {
        mode.value = mode.value === 'forgot-password' ? 'login' : 'forgot-password';
    }

    function close(): void {
        isVisible.value = false;
    }

    function clearResetToken(): void {
        passwordResetToken.value = '';
    }

    return {
        clearResetToken,
        close,
        isVisible,
        mode,
        openLogin,
        openRegister,
        openResetPassword,
        passwordResetToken,
        showLogin,
        showRegister,
        toggleForgotPassword,
    };
}
