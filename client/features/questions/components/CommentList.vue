<script setup lang="ts">
import CommentItem from './CommentItem.vue';
import type { CommentData } from '../../../types.ts';

defineProps<{
    comments: CommentData[];
}>();
</script>

<template>
    <div class="answers">
        <div class="comments-header">
            <h3>Comments</h3>
        </div>
        <CommentItem
            v-for="comment in comments"
            :key="comment.id"
            :comment="comment"
        />
        <p v-if="!comments.length" class="muted">No answers yet.</p>
    </div>
</template>
