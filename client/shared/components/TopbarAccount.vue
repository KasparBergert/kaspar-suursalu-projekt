<script setup lang="ts">
import { ChevronDown, Globe2, LogIn, LogOut } from 'lucide-vue-next';
import type { TopbarActions, TopbarModel } from '../../types.ts';

defineProps<{
    actions: Pick<TopbarActions, 'logout' | 'openAuth' | 'openQuestionModal'>;
    model: Pick<TopbarModel, 'isSubmitting' | 'user'>;
}>();
</script>

<template>
    <div class="account">
        <button v-if="!model.user" class="secondary-button" type="button" @click="actions.openAuth">
            <LogIn class="action-icon" :stroke-width="2.4" />
            Log in
        </button>
        <span v-if="model.user" class="quora-plus-button" aria-hidden="true">
            Try Quora+
        </span>
        <span v-if="model.user" class="user-chip">{{ model.user.name }}</span>
        <span v-if="model.user" class="icon-button icon-button-static" aria-hidden="true">
            <Globe2 class="topbar-icon" :stroke-width="2.2" />
        </span>
        <button v-if="model.user" class="primary-button topbar-primary" type="button" @click="actions.openQuestionModal">
            Add question
            <ChevronDown class="action-icon" :stroke-width="2.5" />
        </button>
        <button
            v-if="model.user"
            class="icon-button"
            type="button"
            :disabled="model.isSubmitting"
            aria-label="Log out"
            @click="actions.logout"
        >
            <LogOut class="topbar-icon" :stroke-width="2.2" />
        </button>
    </div>
</template>
