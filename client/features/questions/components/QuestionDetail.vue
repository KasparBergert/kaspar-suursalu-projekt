<script setup lang="ts">
import AnswerForm from './AnswerForm.vue';
import CommentList from './CommentList.vue';
import type { CommentSectionModel } from '../../../types.ts';

defineProps<{
    model: CommentSectionModel;
}>();
</script>

<template>
    <section class="comments-panel">
        <AnswerForm
            v-if="model.isAuthenticated"
        />
        <CommentList :comments="model.comments" />
    </section>
</template>
