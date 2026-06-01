<script setup lang="ts">
import { ref } from 'vue';
import AuthNotice from './AuthNotice.vue';
import type { AuthPageActions, AuthFormModel } from '../../../types.ts';

const props = defineProps<{
    actions: Pick<AuthPageActions, 'resetPassword'>;
    model: AuthFormModel;
}>();

const password = ref('');

function submit(): void {
    void props.actions.resetPassword(password.value);
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
            <button class="login-submit-button login-submit-button-wide" type="submit" :disabled="model.isSubmitting">
                Reset password
            </button>
        </div>
    </form>
</template>
