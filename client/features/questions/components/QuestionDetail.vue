<script setup lang="ts">
import AnswerForm from './AnswerForm.vue';
import CommentList from './CommentList.vue';
import type { CommentSectionModel } from '../../../types.ts';

defineProps<{
    model: CommentSectionModel;
}>();

const emit = defineEmits<{
    answer: [text: string];
}>();
</script>

<template>
    <section class="comments-panel">
        <AnswerForm
            v-if="model.isAuthenticated"
            :is-submitting="model.isSubmitting"
            @answer="emit('answer', $event)"
        />
        <CommentList :comments="model.comments" />
    </section>
</template>
