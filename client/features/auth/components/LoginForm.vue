<script setup lang="ts">
import { ref } from 'vue';
import AuthNotice from './AuthNotice.vue';
import { useAuthStore } from '../../../stores/useAuthStore.ts';
import type { AuthCredentials } from '../../../types.ts';

const auth = useAuthStore();
const model = auth.authPageModel;

const form = ref<AuthCredentials>({
    email: '',
    password: '',
});

function submit(): void {
    void auth.submitAuth({ ...form.value });
}
</script>

<template>
    <form class="auth-form" @submit.prevent="submit">
        <h2>Login</h2>
        <AuthNotice :error-message="model.errorMessage" :message="model.message" />

        <label>
            Email
            <input v-model="form.email" type="email" autocomplete="email" placeholder="Your email" required>
        </label>
        <label>
            Password
            <input
                v-model="form.password"
                type="password"
                autocomplete="current-password"
                placeholder="Your password"
                required
            >
        </label>

        <div class="auth-submit-row">
            <button class="forgot-password-button" type="button" @click="auth.toggleForgotPassword">
                Forgot password?
            </button>
            <button class="login-submit-button" type="submit" :disabled="model.isSubmitting">
                Login
            </button>
        </div>
        <button class="auth-switch-button" type="button" @click="auth.showRegisterPage">
            Create account
        </button>
    </form>
</template>
