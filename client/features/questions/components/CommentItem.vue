<script setup lang="ts">
import type { CommentData } from '../../../types.ts';
import { formatDate } from '../../../utils/formatDate.ts';

defineProps<{
    comment: CommentData;
}>();
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
        </div>
    </article>
</template>
