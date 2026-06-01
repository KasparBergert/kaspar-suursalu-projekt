<script setup lang="ts">
import { ref } from 'vue';

defineProps<{
    isSubmitting: boolean;
}>();

const emit = defineEmits<{
    answer: [text: string];
}>();

const answerText = ref('');

function submit(): void {
    emit('answer', answerText.value);
    answerText.value = '';
}
</script>

<template>
    <form class="answer-form" @submit.prevent="submit">
        <div class="comment-avatar" aria-hidden="true">K</div>
        <input v-model="answerText" type="text" placeholder="Add a comment..." required>
        <button class="primary-button" type="submit" :disabled="isSubmitting">
            Comment
        </button>
    </form>
</template>
