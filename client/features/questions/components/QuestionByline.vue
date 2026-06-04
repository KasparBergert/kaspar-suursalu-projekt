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
            <span class="question-author">
                {{ showAuthor ? question.user.name : 'You' }}
            </span>
            <span class="question-subline">Shared just now</span>
        </div>
    </div>
</template>
