<script setup lang="ts">
import QuestionList from '../features/questions/components/QuestionList.vue';
import type { QuestionData } from '../types.ts';

defineProps<{
    isLoading: boolean;
    questions: QuestionData[];
    selectedQuestionId: string | null;
}>();

defineEmits<{
    open: [questionId: string];
    upvote: [question: QuestionData];
}>();
</script>

<template>
    <QuestionList
        empty-text="No questions yet."
        :is-loading="isLoading"
        :questions="questions"
        :selected-question-id="selectedQuestionId"
        show-author
        title="Questions"
        @open="$emit('open', $event)"
        @upvote="$emit('upvote', $event)"
    />
</template>
