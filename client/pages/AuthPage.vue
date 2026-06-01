<script setup lang="ts">
import { ref } from 'vue';
import type { AuthCredentials, RegisterPayload } from '../types.ts';

type AuthPageMode = 'login' | 'register' | 'forgot-password' | 'reset-password';

defineProps<{
    errorMessage: string;
    isSubmitting: boolean;
    message: string;
    mode: AuthPageMode;
}>();

const emit = defineEmits<{
    forgotPassword: [];
    requestPasswordReset: [email: string];
    resetPassword: [password: string];
    showLogin: [];
    showRegister: [];
    submit: [payload: AuthCredentials | RegisterPayload];
}>();

const form = ref({
    email: '',
    name: '',
    password: '',
    resetPassword: '',
});

function submit(): void {
    emit('submit', {
        email: form.value.email,
        password: form.value.password,
    });
}

function register(): void {
    emit('submit', {
        name: form.value.name,
        email: form.value.email,
        password: form.value.password,
    });
}

function requestPasswordReset(): void {
    emit('requestPasswordReset', form.value.email);
}

function resetPassword(): void {
    emit('resetPassword', form.value.resetPassword);
}
</script>

<template>
    <main class="auth-page">
        <section class="auth-card">
            <div class="auth-heading">
                <h1>Quora</h1>
                <p>A place to share knowledge and better understand the world</p>
            </div>

            <div class="auth-body">
                <form v-if="mode === 'login'" class="auth-form" @submit.prevent="submit">
                    <h2>Login</h2>
                    <div v-if="message" class="auth-notice auth-notice-success">{{ message }}</div>
                    <div v-if="errorMessage" class="auth-notice auth-notice-error">{{ errorMessage }}</div>

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
                        <button class="forgot-password-button" type="button" @click="$emit('forgotPassword')">
                            Forgot password?
                        </button>
                        <button class="login-submit-button" type="submit" :disabled="isSubmitting">
                            Login
                        </button>
                    </div>
                    <button class="auth-switch-button" type="button" @click="$emit('showRegister')">
                        Create account
                    </button>
                </form>

                <form v-else-if="mode === 'register'" class="auth-form" @submit.prevent="register">
                    <h2>Register</h2>
                    <div v-if="message" class="auth-notice auth-notice-success">{{ message }}</div>
                    <div v-if="errorMessage" class="auth-notice auth-notice-error">{{ errorMessage }}</div>

                    <label>
                        Name
                        <input v-model="form.name" autocomplete="name" placeholder="Your name" required>
                    </label>
                    <label>
                        Email
                        <input v-model="form.email" type="email" autocomplete="email" placeholder="Your email" required>
                    </label>
                    <label>
                        Password
                        <input
                            v-model="form.password"
                            type="password"
                            autocomplete="new-password"
                            placeholder="Your password"
                            required
                        >
                    </label>

                    <div class="auth-submit-row auth-submit-row-end">
                        <button class="login-submit-button login-submit-button-wide" type="submit" :disabled="isSubmitting">
                            Register
                        </button>
                    </div>
                    <button class="auth-switch-button" type="button" @click="$emit('showLogin')">
                        Already have an account? Login
                    </button>
                </form>

                <form v-else-if="mode === 'forgot-password'" class="auth-form" @submit.prevent="requestPasswordReset">
                    <h2>Forgot password</h2>
                    <div v-if="message" class="auth-notice auth-notice-success">{{ message }}</div>
                    <div v-if="errorMessage" class="auth-notice auth-notice-error">{{ errorMessage }}</div>

                    <label>
                        Email
                        <input v-model="form.email" type="email" autocomplete="email" placeholder="Your email" required>
                    </label>

                    <div class="auth-submit-row">
                        <button class="forgot-password-button" type="button" @click="$emit('forgotPassword')">
                            Back to login
                        </button>
                        <button class="login-submit-button login-submit-button-wide" type="submit" :disabled="isSubmitting">
                            Send reset link
                        </button>
                    </div>
                </form>

                <form v-else class="auth-form" @submit.prevent="resetPassword">
                    <h2>Reset password</h2>
                    <div v-if="message" class="auth-notice auth-notice-success">{{ message }}</div>
                    <div v-if="errorMessage" class="auth-notice auth-notice-error">{{ errorMessage }}</div>

                    <label>
                        New password
                        <input
                            v-model="form.resetPassword"
                            type="password"
                            autocomplete="new-password"
                            placeholder="New password"
                            required
                        >
                    </label>

                    <div class="auth-submit-row auth-submit-row-end">
                        <button class="login-submit-button login-submit-button-wide" type="submit" :disabled="isSubmitting">
                            Reset password
                        </button>
                    </div>
                </form>
            </div>
        </section>
    </main>
</template>
