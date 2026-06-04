<script setup lang="ts">
import { Home } from 'lucide-vue-next';
import { useAppStore } from '../../stores/useAppStore.ts';

const app = useAppStore();
</script>

<template>
    <nav class="nav-actions">
        <button
            class="nav-button"
            type="button"
            aria-label="Home"
            @click="app.showFeed"
        >
            <Home class="topbar-icon" :stroke-width="2.2" />
        </button>
    </nav>
</template>
