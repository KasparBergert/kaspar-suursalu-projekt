<script setup lang="ts">
import { LogIn, LogOut } from 'lucide-vue-next';
import { useAuthStore } from '../../stores/useAuthStore.ts';

const auth = useAuthStore();
</script>

<template>
    <div class="account">
        <button v-if="!auth.session.user.value" class="secondary-button" type="button" @click="auth.openLoginPage">
            <LogIn class="action-icon" :stroke-width="2.4" />
            Log in
        </button>
        <span v-if="auth.session.user.value" class="user-chip">{{ auth.session.user.value.name }}</span>
        <button
            v-if="auth.session.user.value"
            class="icon-button"
            type="button"
            :disabled="auth.isSubmitting.value"
            aria-label="Log out"
            @click="auth.logout"
        >
            <LogOut class="topbar-icon" :stroke-width="2.2" />
        </button>
    </div>
</template>
