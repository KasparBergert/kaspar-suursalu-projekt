<script setup lang="ts">
import TopbarAccount from './TopbarAccount.vue';
import TopbarNav from './TopbarNav.vue';
import TopbarSearch from './TopbarSearch.vue';
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

        <TopbarNav :actions="actions" :model="model" />
        <TopbarSearch />
        <TopbarAccount :actions="actions" :model="model" />
    </header>
</template>
