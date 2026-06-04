<script setup lang="ts">
import { Search } from 'lucide-vue-next';
import { useQuestionSearchStore } from '../../features/questions/composables/useQuestionSearchStore.ts';

const search = useQuestionSearchStore();

function submit(): void {
    void search.search();
}
</script>

<template>
    <form class="topbar-search" @submit.prevent="submit">
        <Search class="search-icon" :stroke-width="2.2" />
        <input
            :value="search.query.value"
            placeholder="Search Quora"
            type="search"
            @input="search.updateQuery(($event.target as HTMLInputElement).value)"
        >
    </form>
</template>
