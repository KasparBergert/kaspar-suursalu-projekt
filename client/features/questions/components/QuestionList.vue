<script setup lang="ts">
import { computed, ref } from 'vue';
import QuestionCard from './QuestionCard.vue';
import type { QuestionListModel } from '../../../types.ts';

const props = defineProps<{
    context?: 'feed' | 'profile';
    model: QuestionListModel;
}>();

const hiddenQuestionIds = ref<Set<string>>(new Set());
const visibleQuestions = computed(() => (
    props.model.questions.filter((question) => !hiddenQuestionIds.value.has(question.id))
));

function hideQuestion(questionId: string): void {
    hiddenQuestionIds.value = new Set([...hiddenQuestionIds.value, questionId]);
}
</script>

<template>
    <div class="section-title">
        <h1>{{ model.title }}</h1>
        <span v-if="model.isLoading">Loading...</span>
    </div>

    <div class="question-grid">
        <QuestionCard
            v-for="question in visibleQuestions"
            :key="question.id"
            :context="context"
            :model="{
                detail: model,
                isSelected: model.selectedQuestionId === question.id,
                question,
            }"
            @hide="hideQuestion"
        />

        <div v-if="!visibleQuestions.length && !model.isLoading" class="empty-state">
            {{ model.emptyText }}
        </div>
    </div>
</template>
