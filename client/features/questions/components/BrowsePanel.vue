<script setup lang="ts">
defineProps<{
    page: number;
    totalPages: number;
}>();

defineEmits<{
    loadFeed: [page: number];
}>();
</script>

<template>
    <section class="panel compact">
        <h2>Browse</h2>
        <button class="wide-button" type="button" @click="$emit('loadFeed', 1)">
            Latest questions
        </button>
        <button
            class="wide-button"
            type="button"
            :disabled="page <= 1"
            @click="$emit('loadFeed', page - 1)"
        >
            Previous page
        </button>
        <button
            class="wide-button"
            type="button"
            :disabled="page >= totalPages"
            @click="$emit('loadFeed', page + 1)"
        >
            Next page
        </button>
        <p class="muted">Page {{ page }} of {{ totalPages }}</p>
    </section>
</template>
