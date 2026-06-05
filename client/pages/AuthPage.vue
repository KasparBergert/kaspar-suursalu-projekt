<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ForgotPasswordForm from '../features/auth/components/ForgotPasswordForm.vue';
import LoginForm from '../features/auth/components/LoginForm.vue';
import RegisterForm from '../features/auth/components/RegisterForm.vue';
import ResetPasswordForm from '../features/auth/components/ResetPasswordForm.vue';
import { usePasswordReset } from '../features/auth/composables/usePasswordReset.ts';
import { useNotice } from '../shared/composables/useNotice.ts';
import { useAuthStore } from '../stores/useAuthStore.ts';
import loginPageBackground from '../../server/assets/login-page-backgound.png';

const auth = useAuthStore();
const passwordReset = usePasswordReset(useNotice());
const route = useRoute();
const router = useRouter();

onMounted(async () => {
    if (route.name === 'password-reset') {
        const resetToken = typeof route.query.token === 'string' ? route.query.token : '';

        if (!resetToken) {
            auth.showLoginPage();
            await router.replace({ name: 'auth' });
            return;
        }

        auth.openResetPasswordForm();
        return;
    }
});
</script>

<template>
    <main class="auth-page" :style="{ backgroundImage: `url(${loginPageBackground})` }">
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
