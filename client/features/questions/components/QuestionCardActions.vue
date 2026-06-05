<script setup lang="ts">
import { ArrowUp, MessageCircle } from 'lucide-vue-next';
import { ref } from 'vue';
import { useQuestionStore } from '../../../stores/useQuestionStore.ts';
import type { QuestionData } from '../../../types.ts';

const props = defineProps<{
    context?: 'feed' | 'profile';
    question: QuestionData;
}>();

const questionStore = useQuestionStore();
const isUpvoted = ref(props.question.likedByUser);
const upvoteCount = ref(props.question.upvotes);
const upvoteIsPending = ref(false);

async function upvote(): Promise<void> {
    if (upvoteIsPending.value) {
        return;
    }

    const nextActiveState = !isUpvoted.value;

    isUpvoted.value = nextActiveState;
    upvoteCount.value += nextActiveState ? 1 : -1;
    upvoteIsPending.value = true;

    try {
        await questionStore.upvoteQuestion(props.question, nextActiveState);
    } finally {
        upvoteIsPending.value = false;
    }
}
</script>

<template>
    <div class="card-actions">
        <button
            class="vote-button"
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
        <button
            class="comment-button"
            type="button"
            aria-label="Comments"
            @click="questionStore.openQuestion(props.question.id, context)"
        >
            <MessageCircle class="action-icon" :stroke-width="2.3" />
            <strong>{{ question.commentCount }}</strong>
        </button>
    </div>
</template>
