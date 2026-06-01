<script setup lang="ts">
import { ref } from 'vue';
import AuthNotice from './AuthNotice.vue';
import type { AuthPageActions, AuthFormModel, RegisterPayload } from '../../../types.ts';

const props = defineProps<{
    actions: Pick<AuthPageActions, 'showLogin' | 'submit'>;
    model: AuthFormModel;
}>();

const form = ref<RegisterPayload>({
    email: '',
    name: '',
    password: '',
});

function submit(): void {
    void props.actions.submit({ ...form.value });
}
</script>

<template>
    <form class="auth-form" @submit.prevent="submit">
        <h2>Register</h2>
        <AuthNotice :error-message="model.errorMessage" :message="model.message" />

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
            <button class="login-submit-button login-submit-button-wide" type="submit" :disabled="model.isSubmitting">
                Register
            </button>
        </div>
        <button class="auth-switch-button" type="button" @click="actions.showLogin">
            Already have an account? Login
        </button>
    </form>
</template>
