<script setup lang="ts">
import ForgotPasswordForm from '../features/auth/components/ForgotPasswordForm.vue';
import LoginForm from '../features/auth/components/LoginForm.vue';
import RegisterForm from '../features/auth/components/RegisterForm.vue';
import ResetPasswordForm from '../features/auth/components/ResetPasswordForm.vue';
import { useAppStore } from '../stores/useAppStore.ts';

const app = useAppStore();
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
                    v-if="app.authPageModel.value.mode === 'login'"
                    :actions="app.authPageActions"
                    :model="app.authPageModel.value"
                />

                <RegisterForm
                    v-else-if="app.authPageModel.value.mode === 'register'"
                    :actions="app.authPageActions"
                    :model="app.authPageModel.value"
                />

                <ForgotPasswordForm
                    v-else-if="app.authPageModel.value.mode === 'forgot-password'"
                    :actions="app.authPageActions"
                    :model="app.authPageModel.value"
                />

                <ResetPasswordForm
                    v-else
                    :actions="app.authPageActions"
                    :model="app.authPageModel.value"
                />
            </div>
        </section>
    </main>
</template>
