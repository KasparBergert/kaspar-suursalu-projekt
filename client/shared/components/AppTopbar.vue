<script setup lang="ts">
import type { AuthUser, View } from '../../types.ts';

defineProps<{
    isSubmitting: boolean;
    isAuthenticated: boolean;
    user: AuthUser | null;
    view: View;
}>();

defineEmits<{
    logout: [];
    openAuth: [];
    openQuestionModal: [];
    showFeed: [];
    showProfile: [];
}>();
</script>

<template>
    <header class="topbar">
        <button class="brand" type="button" @click="$emit('showFeed')">
            Q
        </button>

        <nav class="nav-actions">
            <button class="nav-button" :class="{ active: view === 'feed' }" type="button" @click="$emit('showFeed')">
                Home
            </button>
            <button class="nav-button" :class="{ active: view === 'profile' }" :disabled="!isAuthenticated"
                type="button" @click="$emit('showProfile')">
                Profile
            </button>
        </nav>

        <div class="account">
            <button v-if="!user" class="secondary-button" type="button" @click="$emit('openAuth')">
                Log in
            </button>
            <button v-if="user" class="primary-button topbar-primary" type="button" @click="$emit('openQuestionModal')">
                Ask
            </button>
            <span v-if="user" class="user-chip">{{ user.name }}</span>
            <button v-if="user" class="secondary-button" type="button" :disabled="isSubmitting"
                @click="$emit('logout')">
                Log out
            </button>
        </div>
    </header>
</template>
