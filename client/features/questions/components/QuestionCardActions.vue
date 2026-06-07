<script setup lang="ts">
import { ArrowDown, ArrowUp, MessageCircle } from 'lucide-vue-next';
import { ref, watch } from 'vue';
import { useQuestionStore } from '../../../stores/useQuestionStore.ts';
import type { QuestionData, VoteState } from '../../../types.ts';

const props = defineProps<{
    context?: 'feed' | 'profile';
    question: QuestionData;
}>();

const questionStore = useQuestionStore();
const voteState = ref<VoteState>(props.question.voteState);
const voteCount = ref(props.question.votes);
const voteIsPending = ref(false);

watch(() => props.question.voteState, (nextVoteState) => {
    voteState.value = nextVoteState;
});

watch(() => props.question.votes, (nextVoteCount) => {
    voteCount.value = nextVoteCount;
});

async function setVote(nextVote: Exclude<VoteState, 'none'>): Promise<void> {
    if (voteIsPending.value) {
        return;
    }

    const previousVoteState = voteState.value;
    const resolvedVote = previousVoteState === nextVote ? 'none' : nextVote;

    voteState.value = resolvedVote;
    voteCount.value += getVoteDelta(previousVoteState, resolvedVote);
    voteIsPending.value = true;

    try {
        await questionStore.voteOnQuestion(props.question, resolvedVote);
    } catch {
        voteState.value = previousVoteState;
        voteCount.value -= getVoteDelta(previousVoteState, resolvedVote);
    } finally {
        voteIsPending.value = false;
    }
}

function getVoteDelta(previousVote: VoteState, nextVote: VoteState): number {
    if (previousVote === nextVote) {
        return 0;
    }

    if (nextVote === 'none') {
        return previousVote === 'up' ? -1 : previousVote === 'down' ? 1 : 0;
    }

    if (previousVote === 'none') {
        return nextVote === 'up' ? 1 : -1;
    }

    return nextVote === 'up' ? 2 : -2;
}
</script>

<template>
    <div class="card-actions">
        <div class="vote-pill">
            <button
                class="vote-button vote-arrow-button"
                :class="{ 'is-active': voteState === 'up' }"
                type="button"
                aria-label="Upvote"
                :aria-pressed="voteState === 'up'"
                :disabled="voteIsPending"
                @click="setVote('up')"
            >
                <ArrowUp class="action-icon" :stroke-width="2.5" />
            </button>
            <strong class="vote-pill-count">{{ voteCount }}</strong>
            <button
                class="vote-button vote-arrow-button"
                :class="{ 'is-active': voteState === 'down' }"
                type="button"
                aria-label="Downvote"
                :aria-pressed="voteState === 'down'"
                :disabled="voteIsPending"
                @click="setVote('down')"
            >
                <ArrowDown class="action-icon" :stroke-width="2.5" />
            </button>
        </div>
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
