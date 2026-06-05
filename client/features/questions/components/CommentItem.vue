<script setup lang="ts">
import { ArrowUp } from 'lucide-vue-next';
import { ref } from 'vue';
import * as questionsApi from '../services/questionsApi.ts';
import { useAuthStore } from '../../../stores/useAuthStore.ts';
import type { CommentData } from '../../../types.ts';
import { formatDate } from '../../../utils/formatDate.ts';

const props = defineProps<{
    comment: CommentData;
}>();

const auth = useAuthStore();
const isUpvoted = ref(props.comment.likedByUser);
const upvoteCount = ref(props.comment.upvotes);
const upvoteIsPending = ref(false);

async function upvote(): Promise<void> {
    if (upvoteIsPending.value) {
        return;
    }

    if (!auth.session.isAuthenticated.value) {
        auth.openLoginPage();
        return;
    }

    const nextActiveState = !isUpvoted.value;

    isUpvoted.value = nextActiveState;
    upvoteCount.value += nextActiveState ? 1 : -1;
    upvoteIsPending.value = true;

    try {
        await questionsApi.upvoteComment(props.comment.id, nextActiveState);
    } catch {
        isUpvoted.value = !nextActiveState;
        upvoteCount.value += nextActiveState ? -1 : 1;
    } finally {
        upvoteIsPending.value = false;
    }
}
</script>

<template>
    <article class="answer">
        <div class="comment-avatar comment-avatar-small" aria-hidden="true">
            {{ comment.user.name.charAt(0).toUpperCase() }}
        </div>
        <div class="answer-body">
            <div class="answer-meta">
                <strong>{{ comment.user.name }}</strong>
                <span>{{ formatDate(comment.createdAt) }}</span>
            </div>
            <p>{{ comment.text }}</p>
            <button
                class="vote-button comment-vote-button"
                :class="{ 'is-active': isUpvoted }"
                type="button"
                :aria-pressed="isUpvoted"
                :disabled="upvoteIsPending"
                @click="upvote"
            >
                <ArrowUp class="action-icon" :stroke-width="2.5" />
                Upvote
                <strong>{{ upvoteCount }}</strong>
            </button>
        </div>
    </article>
</template>
