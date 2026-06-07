<script setup lang="ts">
import { useModal } from '../composables/useModal.ts';

const { activeComponent, closeModal, state } = useModal();
</script>

<template>
    <Teleport to="body">
        <div v-if="state.isOpen && activeComponent" class="modal-backdrop" @click="closeModal">
            <section
                class="modal-dialog"
                role="dialog"
                aria-modal="true"
                :aria-label="state.title || 'Dialog'"
                @click.stop
            >
                <header v-if="state.title" class="modal-header">
                    <h2>{{ state.title }}</h2>
                </header>
                <button
                    class="modal-close"
                    type="button"
                    aria-label="Close dialog"
                    @click="closeModal"
                >
                    &times;
                </button>

                <component
                    :is="activeComponent"
                    v-bind="state.props"
                    @close="closeModal"
                />
            </section>
        </div>
    </Teleport>
</template>
