<script setup lang="ts">
import { ArrowDown, ArrowUp } from 'lucide-vue-next';
import { ref, watch } from 'vue';
import * as questionsApi from '../services/questionsApi.ts';
import { useAuthStore } from '../../../stores/useAuthStore.ts';
import type { CommentData, VoteState } from '../../../types.ts';
import { formatDate } from '../../../utils/formatDate.ts';

const props = defineProps<{
    comment: CommentData;
}>();

const auth = useAuthStore();
const voteState = ref<VoteState>(props.comment.voteState);
const voteCount = ref(props.comment.votes);
const voteIsPending = ref(false);

watch(() => props.comment.voteState, (nextVoteState) => {
    voteState.value = nextVoteState;
});

watch(() => props.comment.votes, (nextVoteCount) => {
    voteCount.value = nextVoteCount;
});

async function setVote(nextVote: Exclude<VoteState, 'none'>): Promise<void> {
    if (voteIsPending.value) {
        return;
    }

    if (!auth.session.isAuthenticated.value) {
        auth.openLoginPage();
        return;
    }

    const previousVoteState = voteState.value;
    const resolvedVote = previousVoteState === nextVote ? 'none' : nextVote;

    voteState.value = resolvedVote;
    voteCount.value += getVoteDelta(previousVoteState, resolvedVote);
    voteIsPending.value = true;

    try {
        await questionsApi.setCommentVote(props.comment.id, resolvedVote);
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
            <div class="vote-pill comment-vote-pill">
                <button
                    class="vote-button vote-arrow-button"
                    :class="{ 'is-active': voteState === 'up' }"
                    type="button"
                    aria-label="Upvote answer"
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
                    aria-label="Downvote answer"
                    :aria-pressed="voteState === 'down'"
                    :disabled="voteIsPending"
                    @click="setVote('down')"
                >
                    <ArrowDown class="action-icon" :stroke-width="2.5" />
                </button>
            </div>
        </div>
    </article>
</template>
