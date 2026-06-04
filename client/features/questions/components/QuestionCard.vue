<script setup lang="ts">
import { X } from 'lucide-vue-next';
import QuestionByline from './QuestionByline.vue';
import QuestionCardActions from './QuestionCardActions.vue';
import QuestionDetail from './QuestionDetail.vue';
import type { QuestionCardModel } from '../../../types.ts';

defineProps<{
    context?: 'feed' | 'profile';
    model: QuestionCardModel;
}>();

const emit = defineEmits<{
    hide: [questionId: string];
}>();
</script>

<template>
    <article class="question-card" :class="{ 'is-selected': model.isSelected }">
        <button
            class="dismiss-x"
            type="button"
            aria-label="Hide question"
            data-tooltip="Hide"
            @click="emit('hide', model.question.id)"
        >
            <X class="action-icon" :stroke-width="2.2" />
        </button>
        <div class="question-open">
            <QuestionByline :question="model.question" :show-author="model.detail.showAuthor" />
            <span class="question-title">{{ model.question.title }}</span>
            <span class="question-description">{{ model.question.description }}</span>
        </div>
        <QuestionCardActions :context="context" :question="model.question" />

        <QuestionDetail
            v-if="model.isSelected"
            :model="model.detail"
        />
    </article>
</template>
