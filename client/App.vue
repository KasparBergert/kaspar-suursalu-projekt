<script setup lang="ts">
import { RouterView } from 'vue-router';
import AppModal from './shared/components/AppModal.vue';
import { useAppStore } from './stores/useAppStore.ts';

useAppStore();
</script>

<template>
    <div class="shell">
        <RouterView />
        <AppModal />
    </div>
</template>
