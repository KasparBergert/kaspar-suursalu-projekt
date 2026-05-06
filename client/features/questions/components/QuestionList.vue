<script setup lang="ts">
import type { QuestionData } from '../../../types.ts';

defineProps<{
    emptyText: string;
    isLoading: boolean;
    questions: QuestionData[];
    selectedQuestionId?: string | null;
    showAuthor?: boolean;
    title: string;
}>();

defineEmits<{
    open: [questionId: string];
    upvote: [question: QuestionData];
}>();
</script>

<template>
    <div class="section-title">
        <h1>{{ title }}</h1>
        <span v-if="isLoading">Loading...</span>
    </div>

    <div class="question-grid">
        <article
            v-for="question in questions"
            :key="question.id"
            class="question-card"
            :class="{ selected: selectedQuestionId === question.id }"
        >
            <button class="question-open" type="button" @click="$emit('open', question.id)">
                <span class="question-title">{{ question.title }}</span>
                <span v-if="showAuthor" class="question-author">
                    Asked by {{ question.user.name }}
                </span>
                <span class="question-description">{{ question.description }}</span>
            </button>
            <div class="card-actions">
                <button class="vote-button" type="button" @click="$emit('upvote', question)">
                    Upvote
                    <strong>{{ question.upvotes }}</strong>
                </button>
                <span>{{ question.commentCount }} answers</span>
            </div>
        </article>

        <div v-if="!questions.length && !isLoading" class="empty-state">
            {{ emptyText }}
        </div>
    </div>
</template>
