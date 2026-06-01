<script setup lang="ts">
import type { QuestionData } from '../../../types.ts';

defineProps<{
    question: QuestionData;
    showAuthor: boolean;
}>();
</script>

<template>
    <div class="question-byline">
        <div class="comment-avatar comment-avatar-small" aria-hidden="true">
            {{ question.user.name.charAt(0).toUpperCase() }}
        </div>
        <div>
            <span v-if="showAuthor" class="question-author">
                {{ question.user.name }} - Follow
            </span>
            <span v-else class="question-author">
                You - Follow
            </span>
            <span class="question-subline">Shared just now</span>
        </div>
    </div>
</template>
