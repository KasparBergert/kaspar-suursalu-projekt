<script setup lang="ts">
import TopbarAccount from './TopbarAccount.vue';
import TopbarNav from './TopbarNav.vue';
import TopbarSearch from './TopbarSearch.vue';
import { useAppStore } from '../../stores/useAppStore.ts';

const app = useAppStore();
</script>

<template>
    <header class="topbar">
        <button class="brand" type="button" @click="app.showFeed">
            Quora
        </button>

        <TopbarNav />
        <TopbarSearch />
        <TopbarAccount />
    </header>
</template>
