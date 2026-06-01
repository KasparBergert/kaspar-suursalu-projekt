<script setup lang="ts">
import { ref } from 'vue';
import type { CommentSectionModel } from '../../../types.ts';
import { formatDate } from '../../../utils/formatDate.ts';

defineProps<{
    model: CommentSectionModel;
}>();

const emit = defineEmits<{
    answer: [text: string];
}>();

const answerText = ref('');

function submitAnswer(): void {
    emit('answer', answerText.value);
    answerText.value = '';
}
</script>

<template>
    <section class="comments-panel">
        <form v-if="model.isAuthenticated" class="answer-form" @submit.prevent="submitAnswer">
            <div class="comment-avatar" aria-hidden="true">K</div>
            <input v-model="answerText" type="text" placeholder="Add a comment..." required>
            <button class="primary-button" type="submit" :disabled="model.isSubmitting">
                Comment
            </button>
        </form>

        <div class="answers">
            <div class="comments-header">
                <h3>Comments</h3>
                <span>Recommended</span>
            </div>
            <article v-for="comment in model.comments" :key="comment.id" class="answer">
                <div class="comment-avatar comment-avatar-small" aria-hidden="true">
                    {{ comment.user.name.charAt(0).toUpperCase() }}
                </div>
                <div class="answer-body">
                <div class="answer-meta">
                    <strong>{{ comment.user.name }}</strong>
                    <span>{{ formatDate(comment.createdAt) }}</span>
                </div>
                <p>{{ comment.text }}</p>
                </div>
            </article>
            <p v-if="!model.comments.length" class="muted">No answers yet.</p>
        </div>
    </section>
</template>
