<script setup lang="ts">
import { ArrowDown, ArrowUp, MessageCircle, MoreHorizontal, Repeat2 } from 'lucide-vue-next';
import { useQuestionStore } from '../../../stores/useQuestionStore.ts';
import type { QuestionData } from '../../../types.ts';

const props = defineProps<{
    context?: 'feed' | 'profile';
    question: QuestionData;
}>();

const questionStore = useQuestionStore();
</script>

<template>
    <div class="card-actions">
        <button class="vote-button" type="button" @click="questionStore.upvoteQuestion(question)">
            <ArrowUp class="action-icon" :stroke-width="2.5" />
            Upvote
            <strong>{{ question.upvotes }}</strong>
        </button>
        <span class="downvote-icon" aria-hidden="true">
            <ArrowDown class="action-icon" :stroke-width="2.5" />
        </span>
        <button
            class="comment-button"
            type="button"
            aria-label="Comments"
            @click="questionStore.openQuestion(props.question.id, context)"
        >
            <MessageCircle class="action-icon" :stroke-width="2.3" />
            <strong>{{ question.commentCount }}</strong>
        </button>
        <span class="reshare-icon" aria-hidden="true">
            <Repeat2 class="action-icon" :stroke-width="2.3" />
        </span>
        <span class="card-menu" aria-hidden="true">
            <MoreHorizontal class="action-icon" :stroke-width="2.6" />
        </span>
    </div>
</template>
