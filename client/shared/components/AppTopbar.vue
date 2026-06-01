<script setup lang="ts">
import {
    Bell,
    ChevronDown,
    Globe2,
    Home,
    List,
    LogIn,
    LogOut,
    Search,
    SquarePen,
    UsersRound,
} from 'lucide-vue-next';
import type { TopbarActions, TopbarModel } from '../../types.ts';

defineProps<{
    actions: TopbarActions;
    model: TopbarModel;
}>();
</script>

<template>
    <header class="topbar">
        <button class="brand" type="button" @click="actions.showFeed">
            Quora
        </button>

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

        <div class="topbar-search" aria-hidden="true">
            <Search class="search-icon" :stroke-width="2.2" />
            <span>Search Quora</span>
        </div>

        <div class="account">
            <button v-if="!model.user" class="secondary-button" type="button" @click="actions.openAuth">
                <LogIn class="action-icon" :stroke-width="2.4" />
                Log in
            </button>
            <span v-if="model.user" class="quora-plus-button" aria-hidden="true">
                Try Quora+
            </span>
            <span v-if="model.user" class="user-chip">{{ model.user.name }}</span>
            <span v-if="model.user" class="icon-button icon-button-static" aria-hidden="true">
                <Globe2 class="topbar-icon" :stroke-width="2.2" />
            </span>
            <button v-if="model.user" class="primary-button topbar-primary" type="button" @click="actions.openQuestionModal">
                Add question
                <ChevronDown class="action-icon" :stroke-width="2.5" />
            </button>
            <button
                v-if="model.user"
                class="icon-button"
                type="button"
                :disabled="model.isSubmitting"
                aria-label="Log out"
                @click="actions.logout"
            >
                <LogOut class="topbar-icon" :stroke-width="2.2" />
            </button>
        </div>
    </header>
</template>
