<script setup lang="ts">
import { CircleHelp, PenLine, SquarePen } from 'lucide-vue-next';
import { nextTick, onMounted, onUnmounted } from 'vue';
import QuestionList from '../features/questions/components/QuestionList.vue';
import type { QuestionListActions, QuestionListModel } from '../types.ts';

const props = defineProps<{
    actions: QuestionListActions;
    model: QuestionListModel;
    onAskQuestion: () => void;
    onLoadMore: () => void | Promise<void>;
}>();

const bottomOffset = 520;

onMounted(() => {
    window.addEventListener('scroll', loadMoreNearBottom, { passive: true });
    void nextTick(loadMoreNearBottom);
});

onUnmounted(() => {
    window.removeEventListener('scroll', loadMoreNearBottom);
});

function loadMoreNearBottom(): void {
    const distanceFromBottom = document.documentElement.scrollHeight - window.innerHeight - window.scrollY;

    if (distanceFromBottom <= bottomOffset) {
        void props.onLoadMore();
    }
}
</script>

<template>
    <section v-if="model.isAuthenticated" class="feed-composer">
        <div class="composer-top">
            <div class="comment-avatar" aria-hidden="true">
                {{ model.user?.name.charAt(0).toUpperCase() ?? 'K' }}
            </div>
            <button class="composer-input" type="button" @click="onAskQuestion">
                What do you want to ask or share?
            </button>
        </div>
        <div class="composer-actions">
            <button class="composer-action" type="button" @click="onAskQuestion">
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

    <QuestionList
        :actions="actions"
        :model="model"
    />
</template>
