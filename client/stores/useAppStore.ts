import { onMounted, watch } from 'vue';
import { useAppRouter } from '../router.ts';
import { useNotice } from '../shared/composables/useNotice.ts';
import { useAuthStore } from './useAuthStore.ts';
import { useQuestionStore } from './useQuestionStore.ts';

let appStore: ReturnType<typeof createAppStore> | null = null;

export function useAppStore() {
    appStore ??= createAppStore();
    return appStore;
}

function createAppStore() {
    const auth = useAuthStore();
    const notice = useNotice();
    const questions = useQuestionStore();
    const router = useAppRouter();

    onMounted(async () => {
        await auth.loadProfile();
        await questions.loadFeed();
    });

    watch(router.currentRoute, async (nextRoute) => {
        if (nextRoute === 'profile') {
            await questions.loadMyQuestions();
        }
    }, { immediate: true });

    function showFeed(): void {
        router.goTo('feed');
    }

    return {
        auth,
        notice,
        questions,
        router,
        showFeed,
    };
}
