import { computed } from 'vue';
import {
    createRouter,
    createWebHistory,
    useRoute,
    useRouter,
    type RouteRecordRaw,
} from 'vue-router';
import AuthPage from './pages/AuthPage.vue';
import FeedPage from './pages/FeedPage.vue';
import ProfilePage from './pages/ProfilePage.vue';
import type { AppRoute, View } from './types.ts';

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        name: 'feed',
        component: FeedPage,
    },
    {
        path: '/profile',
        name: 'profile',
        component: ProfilePage,
    },
    {
        path: '/auth',
        name: 'auth',
        component: AuthPage,
    },
    {
        path: '/:pathMatch(.*)*',
        redirect: '/',
    },
];

export const router = createRouter({
    history: createWebHistory(),
    routes,
});

export function useAppRouter() {
    const route = useRoute();
    const vueRouter = useRouter();
    const currentRoute = computed<View>(() => (
        route.name === 'profile' ? 'profile' : 'feed'
    ));
    const isAuthRoute = computed(() => route.name === 'auth');

    function goTo(nextRoute: AppRoute): void {
        if (route.name === nextRoute) {
            return;
        }

        void vueRouter.push({ name: nextRoute });
    }

    return {
        currentRoute,
        goTo,
        isAuthRoute,
    };
}
