<script setup lang="ts">
import { ref } from 'vue';
import AuthNotice from './AuthNotice.vue';
import type { AuthPageActions, AuthFormModel } from '../../../types.ts';

const props = defineProps<{
    actions: Pick<AuthPageActions, 'forgotPassword' | 'requestPasswordReset'>;
    model: AuthFormModel;
}>();

const email = ref('');

function submit(): void {
    void props.actions.requestPasswordReset(email.value);
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
            <button class="forgot-password-button" type="button" @click="actions.forgotPassword">
                Back to login
            </button>
            <button class="login-submit-button login-submit-button-wide" type="submit" :disabled="model.isSubmitting">
                Send reset link
            </button>
        </div>
    </form>
</template>
