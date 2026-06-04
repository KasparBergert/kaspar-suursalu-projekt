<script setup lang="ts">
import { computed } from "vue";
import FeedComposer from "../features/questions/components/FeedComposer.vue";
import QuestionList from "../features/questions/components/QuestionList.vue";
import AppTopbar from "../shared/components/AppTopbar.vue";
import NoticeStack from "../shared/components/NoticeStack.vue";
import { useInfiniteFeed } from "../features/questions/composables/useInfiniteFeed.ts";
import { useQuestionSearchStore } from "../features/questions/composables/useQuestionSearchStore.ts";
import { useNotice } from "../shared/composables/useNotice.ts";
import { useQuestionStore } from "../stores/useQuestionStore.ts";
import type { QuestionListModel } from "../types.ts";

const notice = useNotice();
const questionStore = useQuestionStore();
const search = useQuestionSearchStore();
const isSearching = computed(() => Boolean(search.activeQuery.value));
const visibleFeedModel = computed<QuestionListModel>(() => ({
  ...questionStore.feedModel.value,
  emptyText: isSearching.value
    ? "No questions matched your search."
    : questionStore.feedModel.value.emptyText,
  isLoading: isSearching.value
    ? search.isLoading.value
    : questionStore.feedModel.value.isLoading,
  questions: isSearching.value
    ? search.questions.value
    : questionStore.feedModel.value.questions,
  title: isSearching.value ? "Search results" : questionStore.feedModel.value.title,
}));

useInfiniteFeed(
  () =>
    isSearching.value ? search.hasMore.value : questionStore.questions.hasMoreFeed.value,
  () => (isSearching.value ? search.loadMore() : questionStore.loadMoreFeed())
);
</script>

<template>
  <AppTopbar />

  <main class="layout feed-layout">
    <section class="content">
      <NoticeStack
        :error-message="notice.errorMessage.value"
        :message="notice.message.value"
      />

      <FeedComposer
        v-if="visibleFeedModel.isAuthenticated"
        :user="visibleFeedModel.user"
      />

      <QuestionList :model="visibleFeedModel" />

      <div v-if="isSearching" class="feed-pagination">
        <span v-if="search.activeQuery.value" class="feed-pagination-query">
          Search: {{ search.activeQuery.value }}
        </span>
        <span class="feed-pagination-page">
          Page {{ search.page.value }} of {{ search.totalPages.value }}
        </span>
        <button
          class="secondary-button"
          type="button"
          :disabled="!search.hasMore.value"
          @click="search.loadMore"
        >
          Load more
        </button>
      </div>
    </section>
  </main>
</template>
