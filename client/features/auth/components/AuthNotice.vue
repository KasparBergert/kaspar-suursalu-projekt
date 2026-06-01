<script setup lang="ts">
defineProps<{
    errorMessage: string;
    message: string;
}>();
</script>

<template>
    <div v-if="message" class="auth-notice auth-notice-success">{{ message }}</div>
    <div v-if="errorMessage" class="auth-notice auth-notice-error">{{ errorMessage }}</div>
</template>
