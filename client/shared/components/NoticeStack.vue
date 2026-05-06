<script setup lang="ts">
defineProps<{
    errorMessage: string;
    message: string;
}>();
</script>

<template>
    <div v-if="message" class="notice success">{{ message }}</div>
    <div v-if="errorMessage" class="notice error">{{ errorMessage }}</div>
</template>
