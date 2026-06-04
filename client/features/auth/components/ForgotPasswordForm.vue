<script setup lang="ts">
import { ref } from 'vue';
import AuthNotice from './AuthNotice.vue';
import { usePasswordReset } from '../composables/usePasswordReset.ts';
import { useNotice } from '../../../shared/composables/useNotice.ts';
import { useAuthStore } from '../../../stores/useAuthStore.ts';

const auth = useAuthStore();
const model = auth.authPageModel;
const passwordReset = usePasswordReset(useNotice());

const email = ref('');
const isSubmitting = ref(false);

async function submit(): Promise<void> {
    isSubmitting.value = true;
    const didRequest = await passwordReset.requestPasswordReset(email.value);
    isSubmitting.value = false;

    if (didRequest) {
        auth.showLoginPage();
    }
}
</script>

<template>
    <form class="auth-form" @submit.prevent="submit">
        <h2>Forgot password</h2>
        <AuthNotice :error-message="model.errorMessage" :message="model.message" />

        <label>
            Email
            <input v-model="email" type="email" autocomplete="email" placeholder="Your email" required>
        </label>

        <div class="auth-submit-row">
            <button class="forgot-password-button" type="button" @click="auth.toggleForgotPassword">
                Back to login
            </button>
            <button
                class="login-submit-button login-submit-button-wide"
                type="submit"
                :disabled="model.isSubmitting || isSubmitting"
            >
                Send reset link
            </button>
        </div>
    </form>
</template>
