<script setup lang="ts">
import { X } from 'lucide-vue-next';
import { ref } from 'vue';
import type { CreateQuestionPayload } from '../../../types.ts';

const props = defineProps<{
    isSubmitting: boolean;
}>();

const emit = defineEmits<{
    close: [];
    submit: [payload: CreateQuestionPayload];
}>();

const title = ref('');
const description = ref('');

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
        <div class="ask-panel-body">
            <button class="ask-panel-close" type="button" aria-label="Close dialog" @click="emit('close')">
                <X class="action-icon" :stroke-width="2.1" />
            </button>

            <form class="ask-panel-form" @submit.prevent="submit">
                <input
                    v-model="title"
                    class="ask-panel-title"
                    placeholder="Why is the sky blue?"
                    required
                >
                <textarea
                    v-model="description"
                    class="ask-panel-description"
                    placeholder="Add the details here..."
                    rows="8"
                    required
                />

                <div class="ask-panel-footer">
                    <button class="ask-panel-cancel" type="button" @click="emit('close')">
                        Cancel
                    </button>
                    <button class="primary-button ask-panel-submit" type="submit" :disabled="props.isSubmitting">
                        Add question
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>
