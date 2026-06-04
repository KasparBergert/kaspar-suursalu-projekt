<script setup lang="ts">
import { useQuestionStore } from '../../../stores/useQuestionStore.ts';
import type { AuthUser } from '../../../types.ts';

defineProps<{
    user: AuthUser | null;
}>();

const questionStore = useQuestionStore();
</script>

<template>
    <section class="feed-composer">
        <div class="composer-top">
            <div class="comment-avatar" aria-hidden="true">
                {{ user?.name.charAt(0).toUpperCase() ?? 'K' }}
            </div>
            <button class="composer-input" type="button" @click="questionStore.openAskQuestionModal">
                What do you want to ask or share?
            </button>
        </div>
    </section>
</template>
