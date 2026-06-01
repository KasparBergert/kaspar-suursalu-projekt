<script setup lang="ts">
import { RouterView } from 'vue-router';
import AppModal from './shared/components/AppModal.vue';
</script>

<template>
    <div class="shell">
        <RouterView />
        <AppModal />
    </div>
</template>
