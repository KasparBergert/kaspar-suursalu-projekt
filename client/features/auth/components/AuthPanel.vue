<script setup lang="ts">
import { LogIn } from 'lucide-vue-next';
import { computed, ref, watch } from 'vue';
import type { AuthCredentials, AuthMode, RegisterPayload } from '../../../types.ts';

const props = defineProps<{
    authMode: AuthMode;
    isSubmitting: boolean;
}>();

const emit = defineEmits<{
    submit: [payload: AuthCredentials | RegisterPayload];
    switchMode: [mode: AuthMode];
}>();

const form = ref({
    name: '',
    email: '',
    password: '',
});

const authTitle = computed(() => props.authMode === 'login' ? 'Log in' : 'Create account');
const authSubmitLabel = computed(() => props.authMode === 'login' ? 'Log in' : 'Sign up');

watch(() => props.authMode, () => {
    form.value.password = '';
});

function submit(): void {
    const payload = props.authMode === 'login'
        ? {
            email: form.value.email,
            password: form.value.password,
        }
        : { ...form.value };

    emit('submit', payload);
    form.value = {
        name: '',
        email: '',
        password: '',
    };
}
</script>

<template>
    <div>
        <div class="segment-control" aria-label="Authentication mode">
            <button
                type="button"
                :class="{ 'is-active': authMode === 'login' }"
                @click="$emit('switchMode', 'login')"
            >
                Log in
            </button>
            <button
                type="button"
                :class="{ 'is-active': authMode === 'register' }"
                @click="$emit('switchMode', 'register')"
            >
                Sign up
            </button>
        </div>

        <form class="form-stack" @submit.prevent="submit">
            <h2>{{ authTitle }}</h2>
            <label v-if="authMode === 'register'">
                Name
                <input v-model="form.name" autocomplete="name" required>
            </label>
            <label>
                Email
                <input v-model="form.email" type="email" autocomplete="email" required>
            </label>
            <label>
                Password
                <input
                    v-model="form.password"
                    type="password"
                    autocomplete="current-password"
                    required
                >
            </label>
            <button class="primary-button" type="submit" :disabled="isSubmitting">
                <LogIn v-if="authMode === 'login'" class="action-icon" :stroke-width="2.4" />
                {{ authSubmitLabel }}
            </button>
        </form>
    </div>
</template>
