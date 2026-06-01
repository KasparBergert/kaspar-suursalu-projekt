import { nextTick, onMounted, onUnmounted } from 'vue';

const bottomOffset = 520;

export function useInfiniteFeed(
    canLoadMore: () => boolean,
    loadMore: () => void | Promise<void>,
) {
    onMounted(() => {
        window.addEventListener('scroll', loadMoreNearBottom, { passive: true });
        void nextTick(loadMoreNearBottom);
    });

    onUnmounted(() => {
        window.removeEventListener('scroll', loadMoreNearBottom);
    });

    function loadMoreNearBottom(): void {
        const distanceFromBottom = document.documentElement.scrollHeight - window.innerHeight - window.scrollY;

        if (canLoadMore() && distanceFromBottom <= bottomOffset) {
            void loadMore();
        }
    }
}
