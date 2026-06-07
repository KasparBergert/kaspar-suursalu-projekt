<script setup lang="ts">
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
const imageSrc = ref<string | undefined>();

function submit(): void {
    emit('submit', {
        description: description.value,
        imageSrc: imageSrc.value,
        title: title.value,
    });
    title.value = '';
    description.value = '';
    imageSrc.value = undefined;
}

function updateImage(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];

    if (!file) {
        imageSrc.value = undefined;
        return;
    }

    const reader = new FileReader();
    reader.addEventListener('load', () => {
        imageSrc.value = typeof reader.result === 'string' ? reader.result : undefined;
    });
    reader.readAsDataURL(file);
}
</script>

<template>
    <div class="ask-panel">
        <div class="ask-panel-body">
            <section class="ask-panel-tip" aria-label="Tips for getting good answers quickly">
                <h3>Tips on getting good answers quickly</h3>
                <ul>
                    <li>Make sure your question has not been asked already</li>
                    <li>Keep your question short and to the point</li>
                    <li>Double-check grammar and spelling</li>
                </ul>
            </section>

            <form class="ask-panel-form" @submit.prevent="submit">
                <input
                    v-model="title"
                    class="ask-panel-title"
                    placeholder='Start your question with "What", "How", "Why", etc.'
                    required
                >
                <textarea
                    v-model="description"
                    class="ask-panel-description"
                    placeholder=""
                    rows="8"
                />

                <label class="ask-panel-image-picker">
                    Add JPG image
                    <input type="file" accept="image/jpeg" @change="updateImage">
                </label>

                <img
                    v-if="imageSrc"
                    class="ask-panel-image-preview"
                    :src="imageSrc"
                    alt=""
                >

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
