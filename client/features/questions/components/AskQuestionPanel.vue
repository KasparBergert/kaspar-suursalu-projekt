<script setup lang="ts">
import { ref } from 'vue';
import type { CreateQuestionPayload } from '../../../types.ts';

defineProps<{
    isSubmitting: boolean;
}>();

const emit = defineEmits<{
    submit: [payload: CreateQuestionPayload];
}>();

const form = ref<CreateQuestionPayload>({
    title: '',
    description: '',
});

function submit(): void {
    emit('submit', { ...form.value });
    form.value = {
        title: '',
        description: '',
    };
}
</script>

<template>
    <form class="form-stack" @submit.prevent="submit">
        <label>
            Title
            <input
                v-model="form.title"
                maxlength="120"
                required
            >
        </label>
        <label>
            Details
            <textarea
                v-model="form.description"
                rows="5"
                required
            />
        </label>
        <button class="primary-button" type="submit" :disabled="isSubmitting">
            Post
        </button>
    </form>
</template>
