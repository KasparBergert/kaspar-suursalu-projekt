<script setup lang="ts">
import { CircleHelp, PenLine, SquarePen } from 'lucide-vue-next';
import type { AuthUser } from '../../../types.ts';

defineProps<{
    user: AuthUser | null;
}>();

defineEmits<{
    askQuestion: [];
}>();
</script>

<template>
    <section class="feed-composer">
        <div class="composer-top">
            <div class="comment-avatar" aria-hidden="true">
                {{ user?.name.charAt(0).toUpperCase() ?? 'K' }}
            </div>
            <button class="composer-input" type="button" @click="$emit('askQuestion')">
                What do you want to ask or share?
            </button>
        </div>
        <div class="composer-actions">
            <button class="composer-action" type="button" @click="$emit('askQuestion')">
                <CircleHelp class="action-icon" :stroke-width="2.3" />
                Ask
            </button>
            <span class="composer-action">
                <SquarePen class="action-icon" :stroke-width="2.3" />
                Answer
            </span>
            <span class="composer-action">
                <PenLine class="action-icon" :stroke-width="2.3" />
                Post
            </span>
        </div>
    </section>
</template>
