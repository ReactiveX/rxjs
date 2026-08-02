<script setup lang="ts">
import { onBeforeUnmount, onMounted, useTemplateRef } from 'vue';

const filterInput = useTemplateRef<HTMLInputElement>('filterInput')

const { query, selected, selectOptions: options } = defineProps<{
  query: string;
  selected: string;
  selectOptions: any[];
}>()

defineEmits<{
  (e: 'update:query', value: string): void;
  (e: 'update:selected', value: string): void;
}>()

const focusFilter = (event: KeyboardEvent) => {
  const target = event.target as HTMLElement | null;
  const isEditing = target?.matches('input, select, textarea') || target?.isContentEditable;

  if (!isEditing && !event.altKey && !event.ctrlKey && !event.metaKey && event.key.toLowerCase() === 'f') {
    event.preventDefault();
    filterInput.value?.focus();
  }
}

onMounted(() => window.addEventListener('keydown', focusFilter));
onBeforeUnmount(() => window.removeEventListener('keydown', focusFilter));
</script>
<template>
  <div class="api-search">
    <select :value="selected" aria-label="API item kind"
      @change="$emit('update:selected', ($event.target as HTMLSelectElement).value)">
      <option v-for="option in options" :key="option.value" :value="option.value">{{ option.label }}</option>
    </select>
    <label>
      <span class="sr-only">Filter API items</span>
      <input ref="filterInput" :value="query"
        @input="$emit('update:query', ($event.target as HTMLInputElement).value)" type="search"
        placeholder="Filter..." />
      <kbd>F</kbd>
    </label>
  </div>
</template>

<style scoped>
.api-search {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.api-search select,
.api-search input {
  min-height: 2.5rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  padding: 0.45rem 0.75rem;
}

.api-search select {
  min-width: 12rem;
}

.api-search label {
  position: relative;
}

.api-search input {
  padding-right: 2.5rem;
}

.api-search kbd {
  position: absolute;
  top: 50%;
  right: 0.65rem;
  transform: translateY(-50%);
  color: var(--vp-c-text-2);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
