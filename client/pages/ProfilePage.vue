<script setup lang="ts">
import QuestionList from '../features/questions/components/QuestionList.vue';
import type { QuestionListActions, QuestionListModel } from '../types.ts';

defineProps<{
    actions: QuestionListActions;
    model: QuestionListModel;
}>();
</script>

<template>
    <QuestionList
        :actions="actions"
        :model="model"
    />
</template>
