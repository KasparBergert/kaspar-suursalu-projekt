<script setup lang="ts">
import { computed } from 'vue';
import type { QuestionData } from '../../../types.ts';

const props = defineProps<{
    question: QuestionData;
    showAuthor: boolean;
}>();

const sharedAtLabel = computed(() => `Shared ${formatRelativeTime(props.question.createdAt)}`);

function formatRelativeTime(value: string): string {
    const postedAt = new Date(value);
    const secondsAgo = Math.max(0, Math.floor((Date.now() - postedAt.getTime()) / 1000));

    if (secondsAgo < 60) {
        return 'just now';
    }

    const minutesAgo = Math.floor(secondsAgo / 60);

    if (minutesAgo < 60) {
        return `${minutesAgo} ${minutesAgo === 1 ? 'minute' : 'minutes'} ago`;
    }

    const hoursAgo = Math.floor(minutesAgo / 60);

    if (hoursAgo < 24) {
        return `${hoursAgo} ${hoursAgo === 1 ? 'hour' : 'hours'} ago`;
    }

    const daysAgo = Math.floor(hoursAgo / 24);

    if (daysAgo < 7) {
        return `${daysAgo} ${daysAgo === 1 ? 'day' : 'days'} ago`;
    }

    return postedAt.toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}
</script>

<template>
    <div class="question-byline">
        <div class="comment-avatar comment-avatar-small" aria-hidden="true">
            {{ question.user.name.charAt(0).toUpperCase() }}
        </div>
        <div>
            <span class="question-author">
                {{ showAuthor ? question.user.name : 'You' }}
            </span>
            <span class="question-subline">{{ sharedAtLabel }}</span>
        </div>
    </div>
</template>
