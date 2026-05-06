import { markRaw, reactive, shallowRef, type Component } from 'vue';

type ModalOptions = {
    props?: Record<string, unknown>;
    title?: string;
};

const activeComponent = shallowRef<Component | null>(null);
const state = reactive({
    isOpen: false,
    props: {} as Record<string, unknown>,
    title: '',
});

export function useModal() {
    function openModal(nextComponent: Component, options: ModalOptions = {}): void {
        activeComponent.value = markRaw(nextComponent);
        state.props = options.props ?? {};
        state.title = options.title ?? '';
        state.isOpen = true;
    }

    function closeModal(): void {
        state.isOpen = false;
        state.props = {};
        state.title = '';
        activeComponent.value = null;
    }

    return {
        activeComponent,
        closeModal,
        openModal,
        state,
    };
}
