<script setup lang="ts">
import { watch } from 'vue';
import { useModal } from '../composables/useModal.ts';

const { closeModal, component, state } = useModal();

watch(
    () => state.isOpen,
    (isOpen) => {
        document.body.classList.toggle('modal-open', isOpen);
    },
);
</script>

<template>
    <Teleport to="body">
        <div v-if="state.isOpen && component" class="modal-backdrop" @click="closeModal">
            <section
                class="modal-dialog"
                role="dialog"
                aria-modal="true"
                :aria-label="state.title || 'Dialog'"
                @click.stop
            >
                <header class="modal-header">
                    <h2 v-if="state.title">{{ state.title }}</h2>
                    <button
                        class="modal-close"
                        type="button"
                        aria-label="Close dialog"
                        @click="closeModal"
                    >
                        &times;
                    </button>
                </header>

                <component
                    :is="component"
                    v-bind="state.props"
                    @close="closeModal"
                />
            </section>
        </div>
    </Teleport>
</template>
