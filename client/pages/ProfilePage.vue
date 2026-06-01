<script setup lang="ts">
import QuestionList from '../features/questions/components/QuestionList.vue';
import AppSidebar from '../shared/components/AppSidebar.vue';
import AppTopbar from '../shared/components/AppTopbar.vue';
import NoticeStack from '../shared/components/NoticeStack.vue';
import { useAppStore } from '../stores/useAppStore.ts';

const app = useAppStore();
</script>

<template>
    <AppTopbar
        :actions="app.topbarActions"
        :model="app.topbarModel.value"
    />

    <main class="layout">
        <AppSidebar
            :is-authenticated="app.session.isAuthenticated.value"
            @ask-question="app.openAskQuestionModal"
            @login="app.openLoginPage"
            @register="app.openRegisterPage"
        />

        <section class="content">
            <NoticeStack
                :error-message="app.notice.errorMessage.value"
                :message="app.notice.message.value"
            />

            <QuestionList
                :actions="app.profileQuestionActions"
                :model="app.profileModel.value"
            />
        </section>
    </main>
</template>
