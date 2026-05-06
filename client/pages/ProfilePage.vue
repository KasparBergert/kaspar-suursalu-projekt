<script setup lang="ts">
import QuestionList from '../features/questions/components/QuestionList.vue';
import type { QuestionData } from '../types.ts';

defineProps<{
    isLoading: boolean;
    questions: QuestionData[];
}>();

defineEmits<{
    open: [questionId: string];
    upvote: [question: QuestionData];
}>();
</script>

<template>
    <QuestionList
        empty-text="You have not asked anything yet."
        :is-loading="isLoading"
        :questions="questions"
        title="Your questions"
        @open="$emit('open', $event)"
        @upvote="$emit('upvote', $event)"
    />
</template>
