<script setup lang="ts">
import QuestionList from '../features/questions/components/QuestionList.vue';
import AppSidebar from '../shared/components/AppSidebar.vue';
import AppTopbar from '../shared/components/AppTopbar.vue';
import NoticeStack from '../shared/components/NoticeStack.vue';
import { useNotice } from '../shared/composables/useNotice.ts';
import { useQuestionStore } from '../stores/useQuestionStore.ts';

const notice = useNotice();
const questionStore = useQuestionStore();
</script>

<template>
    <AppTopbar />

    <main class="layout">
        <AppSidebar />

        <section class="content">
            <NoticeStack
                :error-message="notice.errorMessage.value"
                :message="notice.message.value"
            />

            <QuestionList
                context="profile"
                :model="questionStore.profileModel.value"
            />
        </section>
    </main>
</template>
