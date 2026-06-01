<script setup lang="ts">
defineProps<{
    isAuthenticated: boolean;
}>();

defineEmits<{
    askQuestion: [];
    login: [];
    register: [];
}>();
</script>

<template>
    <aside class="sidebar">
        <section v-if="!isAuthenticated" class="rail-panel">
            <h2>Join the conversation</h2>
            <button class="rail-link rail-link-strong" type="button" @click="$emit('login')">
                Log in
            </button>
            <button class="rail-link rail-link-strong" type="button" @click="$emit('register')">
                Register
            </button>
        </section>

        <section v-else class="rail-panel">
            <h2>Start a thread</h2>
            <button class="rail-link rail-link-strong" type="button" @click="$emit('askQuestion')">
                Ask a question
            </button>
        </section>
    </aside>
</template>
