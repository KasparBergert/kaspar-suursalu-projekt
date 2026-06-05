<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import AuthNotice from './AuthNotice.vue';
import { usePasswordReset } from '../composables/usePasswordReset.ts';
import { useNotice } from '../../../shared/composables/useNotice.ts';
import { useAuthStore } from '../../../stores/useAuthStore.ts';

const auth = useAuthStore();
const model = auth.authPageModel;
const passwordReset = usePasswordReset(useNotice());
const route = useRoute();

const password = ref('');
const isSubmitting = ref(false);

async function submit(): Promise<void> {
    const token = typeof route.query.token === 'string' ? route.query.token : '';

    if (!token) {
        model.errorMessage = 'Password reset link is invalid or expired.';
        return;
    }

    isSubmitting.value = true;
    const didReset = await passwordReset.resetPassword(token, password.value);
    isSubmitting.value = false;

    if (didReset) {
        auth.showLoginPage();
    }
}
</script>

<template>
    <form class="auth-form" @submit.prevent="submit">
        <h2>Reset password</h2>
        <AuthNotice :error-message="model.errorMessage" :message="model.message" />

        <label>
            New password
            <input
                v-model="password"
                type="password"
                autocomplete="new-password"
                placeholder="New password"
                required
            >
        </label>

        <div class="auth-submit-row auth-submit-row-end">
            <button
                class="login-submit-button login-submit-button-wide"
                type="submit"
                :disabled="model.isSubmitting || isSubmitting"
            >
                Reset password
            </button>
        </div>
    </form>
</template>
