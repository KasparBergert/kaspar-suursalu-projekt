<script setup lang="ts">
import { X, Users2, ChevronDown, ChevronRight } from 'lucide-vue-next';
import { computed, ref } from 'vue';
import type { CreateQuestionPayload } from '../../../types.ts';

const props = defineProps<{
    isSubmitting: boolean;
}>();

const emit = defineEmits<{
    close: [];
    submit: [payload: CreateQuestionPayload];
}>();

const mode = ref<'question' | 'post'>('question');
const visibility = ref('Public');
const title = ref('');
const description = ref('');

const primaryLabel = computed(() => (mode.value === 'question' ? 'Add question' : 'Create post'));
const titlePlaceholder = computed(() => (
    mode.value === 'question'
        ? 'Start your question with What, How, Why, etc.'
        : 'Write your post title'
));
const descriptionPlaceholder = computed(() => (
    mode.value === 'question'
        ? 'Add more details'
        : 'Share your thoughts'
));

function submit(): void {
    emit('submit', {
        description: description.value,
        title: title.value,
    });
    title.value = '';
    description.value = '';
}
</script>

<template>
    <div class="ask-panel">
        <div class="ask-panel-tabs">
            <button
                class="ask-panel-tab"
                :class="{ 'is-active': mode === 'question' }"
                type="button"
                @click="mode = 'question'"
            >
                Add Question
            </button>
            <button
                class="ask-panel-tab"
                :class="{ 'is-active': mode === 'post' }"
                type="button"
                @click="mode = 'post'"
            >
                Create Post
            </button>
        </div>

        <div class="ask-panel-body">
            <button class="ask-panel-close" type="button" aria-label="Close dialog" @click="emit('close')">
                <X class="action-icon" :stroke-width="2.1" />
            </button>

            <section class="ask-panel-tip">
                <h3>Tips on getting good answers quickly</h3>
                <ul>
                    <li>Make sure your question has not been asked already</li>
                    <li>Keep your question short and to the point</li>
                    <li>Double-check grammar and spelling</li>
                </ul>
            </section>

            <div class="ask-panel-meta">
                <div class="comment-avatar comment-avatar-small" aria-hidden="true">K</div>
                <button class="ask-panel-audience" type="button">
                    <Users2 class="action-icon" :stroke-width="2.1" />
                    {{ visibility }}
                    <ChevronDown class="action-icon" :stroke-width="2.1" />
                </button>
                <button class="ask-panel-mini" type="button">
                    <ChevronRight class="action-icon" :stroke-width="2.1" />
                </button>
            </div>

            <form class="ask-panel-form" @submit.prevent="submit">
                <input
                    v-model="title"
                    class="ask-panel-title"
                    :placeholder="titlePlaceholder"
                    required
                >
                <textarea
                    v-model="description"
                    class="ask-panel-description"
                    :placeholder="descriptionPlaceholder"
                    rows="8"
                    required
                />

                <div class="ask-panel-footer">
                    <button class="ask-panel-cancel" type="button" @click="emit('close')">
                        Cancel
                    </button>
                    <button class="primary-button ask-panel-submit" type="submit" :disabled="props.isSubmitting">
                        {{ primaryLabel }}
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>
