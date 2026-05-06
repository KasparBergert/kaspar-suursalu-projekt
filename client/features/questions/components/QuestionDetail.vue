<script setup lang="ts">
import { ref } from 'vue';
import type { CommentData, QuestionData, QuestionWithCommentsData } from '../../../types.ts';
import { formatDate } from '../../../utils/formatDate.ts';

defineProps<{
    comments: CommentData[];
    isAuthenticated: boolean;
    isSubmitting: boolean;
    selectedQuestion: QuestionWithCommentsData | null;
}>();

const emit = defineEmits<{
    answer: [text: string];
    upvote: [question: QuestionData];
}>();

const answerText = ref('');

function submitAnswer(): void {
    emit('answer', answerText.value);
    answerText.value = '';
}
</script>

<template>
    <section v-if="selectedQuestion" class="panel detail-panel">
        <p class="eyebrow">Question</p>
        <h2>{{ selectedQuestion.question.title }}</h2>
        <p class="detail-description">{{ selectedQuestion.question.description }}</p>
        <div class="meta-row">
            <span>{{ selectedQuestion.question.user.name }}</span>
            <span>{{ selectedQuestion.question.upvotes }} upvotes</span>
            <span>{{ selectedQuestion.question.commentCount }} answers</span>
        </div>
        <button
            class="secondary-button"
            type="button"
            @click="$emit('upvote', selectedQuestion.question)"
        >
            Upvote
        </button>

        <form v-if="isAuthenticated" class="answer-form" @submit.prevent="submitAnswer">
            <label>
                Answer
                <textarea v-model="answerText" rows="4" required />
            </label>
            <button class="primary-button" type="submit" :disabled="isSubmitting">
                Answer
            </button>
        </form>

        <div class="answers">
            <h3>Answers</h3>
            <article v-for="comment in comments" :key="comment.id" class="answer">
                <div class="answer-meta">
                    <strong>{{ comment.user.name }}</strong>
                    <span>{{ formatDate(comment.createdAt) }}</span>
                </div>
                <p>{{ comment.text }}</p>
            </article>
            <p v-if="!comments.length" class="muted">No answers yet.</p>
        </div>
    </section>

    <section v-else class="panel detail-panel">
        <h2>Select a question</h2>
    </section>
</template>
