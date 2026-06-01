<script setup lang="ts">
import { Bell, Home, List, SquarePen, UsersRound } from 'lucide-vue-next';
import type { TopbarActions, TopbarModel } from '../../types.ts';

defineProps<{
    actions: Pick<TopbarActions, 'showFeed' | 'showProfile'>;
    model: Pick<TopbarModel, 'isAuthenticated' | 'view'>;
}>();
</script>

<template>
    <nav class="nav-actions">
        <button
            class="nav-button"
            :class="{ 'is-active': model.view === 'feed' }"
            type="button"
            aria-label="Home"
            @click="actions.showFeed"
        >
            <Home class="topbar-icon" :stroke-width="2.2" />
        </button>
        <span class="nav-button nav-button-static" aria-hidden="true">
            <List class="topbar-icon" :stroke-width="2.2" />
        </span>
        <span class="nav-button nav-button-static" aria-hidden="true">
            <SquarePen class="topbar-icon" :stroke-width="2.2" />
        </span>
        <button
            class="nav-button"
            :class="{ 'is-active': model.view === 'profile' }"
            :disabled="!model.isAuthenticated"
            type="button"
            aria-label="Profile"
            @click="actions.showProfile"
        >
            <UsersRound class="topbar-icon" :stroke-width="2.2" />
        </button>
        <span class="nav-button nav-button-static" aria-hidden="true">
            <Bell class="topbar-icon" :stroke-width="2.2" />
        </span>
    </nav>
</template>
