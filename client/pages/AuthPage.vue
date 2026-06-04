<script setup lang="ts">
import { onMounted } from 'vue';
import ForgotPasswordForm from '../features/auth/components/ForgotPasswordForm.vue';
import LoginForm from '../features/auth/components/LoginForm.vue';
import RegisterForm from '../features/auth/components/RegisterForm.vue';
import ResetPasswordForm from '../features/auth/components/ResetPasswordForm.vue';
import { usePasswordReset } from '../features/auth/composables/usePasswordReset.ts';
import { useNotice } from '../shared/composables/useNotice.ts';
import { useAuthStore } from '../stores/useAuthStore.ts';

const auth = useAuthStore();
const passwordReset = usePasswordReset(useNotice());

onMounted(async () => {
    const resetToken = new URLSearchParams(window.location.search).get('resetToken');

    if (!resetToken) {
        return;
    }

    auth.openResetPasswordForm(resetToken);
    await passwordReset.verifyPasswordResetToken(resetToken);
});
</script>

<template>
    <main class="auth-page">
        <section class="auth-card">
            <div class="auth-heading">
                <h1>Quora</h1>
                <p>A place to share knowledge and better understand the world</p>
            </div>

            <div class="auth-body">
                <LoginForm
                    v-if="auth.authPageModel.value.mode === 'login'"
                />

                <RegisterForm
                    v-else-if="auth.authPageModel.value.mode === 'register'"
                />

                <ForgotPasswordForm
                    v-else-if="auth.authPageModel.value.mode === 'forgot-password'"
                />

                <ResetPasswordForm
                    v-else
                />
            </div>
        </section>
    </main>
</template>
