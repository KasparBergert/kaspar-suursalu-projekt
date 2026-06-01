<script setup lang="ts">
import { ArrowDown, ArrowUp, MessageCircle, MoreHorizontal, Repeat2, X } from 'lucide-vue-next';
import QuestionDetail from './QuestionDetail.vue';
import type { QuestionListActions, QuestionListModel } from '../../../types.ts';

defineProps<{
    actions: QuestionListActions;
    model: QuestionListModel;
}>();
</script>

<template>
    <div class="section-title">
        <h1>{{ model.title }}</h1>
        <span v-if="model.isLoading">Loading...</span>
    </div>

    <div class="question-grid">
        <article
            v-for="question in model.questions"
            :key="question.id"
            class="question-card"
            :class="{ 'is-selected': model.selectedQuestionId === question.id }"
        >
            <span class="dismiss-x" aria-hidden="true">
                <X class="action-icon" :stroke-width="2.2" />
            </span>
            <div class="question-open">
                <div class="question-byline">
                    <div class="comment-avatar comment-avatar-small" aria-hidden="true">
                        {{ question.user.name.charAt(0).toUpperCase() }}
                    </div>
                    <div>
                        <span v-if="model.showAuthor" class="question-author">
                            {{ question.user.name }} · Follow
                        </span>
                        <span v-else class="question-author">
                            You · Follow
                        </span>
                        <span class="question-subline">Shared just now</span>
                    </div>
                </div>
                <span class="question-title">{{ question.title }}</span>
                <span class="question-description">{{ question.description }}</span>
            </div>
            <div class="card-actions">
                <button class="vote-button" type="button" @click="actions.upvote(question)">
                    <ArrowUp class="action-icon" :stroke-width="2.5" />
                    Upvote
                    <strong>{{ question.upvotes }}</strong>
                </button>
                <span class="downvote-icon" aria-hidden="true">
                    <ArrowDown class="action-icon" :stroke-width="2.5" />
                </span>
                <button class="comment-button" type="button" aria-label="Comments" @click="actions.open(question.id)">
                    <MessageCircle class="action-icon" :stroke-width="2.3" />
                    <strong>{{ question.commentCount }}</strong>
                </button>
                <span class="reshare-icon" aria-hidden="true">
                    <Repeat2 class="action-icon" :stroke-width="2.3" />
                </span>
                <span class="card-menu" aria-hidden="true">
                    <MoreHorizontal class="action-icon" :stroke-width="2.6" />
                </span>
            </div>

            <QuestionDetail
                v-if="model.selectedQuestionId === question.id"
                :model="model"
                @answer="actions.answer"
            />
        </article>

        <div v-if="!model.questions.length && !model.isLoading" class="empty-state">
            {{ model.emptyText }}
        </div>
    </div>
</template>
