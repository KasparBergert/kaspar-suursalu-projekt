import type { VoteState } from '../../interfaces/QuestionInterfaces.ts';

export function getVoteStateFromRecord(vote?: { isUpvote: boolean } | null): VoteState {
    if (!vote) {
        return 'none';
    }

    return vote.isUpvote ? 'up' : 'down';
}

export function getVoteDelta(currentVote: VoteState, nextVote: VoteState): number {
    if (currentVote === nextVote) {
        return 0;
    }

    if (nextVote === 'none') {
        return currentVote === 'up' ? -1 : currentVote === 'down' ? 1 : 0;
    }

    if (currentVote === 'none') {
        return nextVote === 'up' ? 1 : -1;
    }

    return nextVote === 'up' ? 2 : -2;
}
