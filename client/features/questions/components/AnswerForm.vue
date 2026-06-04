<script setup lang="ts">
import { ref } from 'vue';
import { useQuestionStore } from '../../../stores/useQuestionStore.ts';

const questionStore = useQuestionStore();
const answerText = ref('');

function submit(): void {
    void questionStore.answerQuestion(answerText.value);
    answerText.value = '';
}
</script>

<template>
    <form class="answer-form" @submit.prevent="submit">
        <div class="comment-avatar" aria-hidden="true">K</div>
        <input v-model="answerText" type="text" placeholder="Add a comment..." required>
        <button class="primary-button" type="submit" :disabled="questionStore.isSubmitting.value">
            Comment
        </button>
    </form>
</template>
