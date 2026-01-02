<script setup lang="ts">
import { useTemplateRef } from 'vue';
import { defineShortcuts } from '@nuxt/ui/composables';

const filterInput = useTemplateRef('filterInput')

const { query, selected, selectOptions: options } = defineProps<{
  query: string;
  selected: string;
  selectOptions: any[];
}>()

defineEmits<{
  (e: 'update:query', value: string): void;
  (e: 'update:selected', value: string): void;
}>()

defineShortcuts({
  'F': () => {
    filterInput.value?.inputRef?.focus()
  }
})
</script>
<template>
  <!-- <div> -->
  <div class="flex items-center gap-2">
    <USelect :model-value="selected" @update:model-value="$emit('update:selected', $event)" :items="options"
      value-key="value" label-key="label" :icon="options.find(option => option.value === selected)?.icon"
      :ui="{ content: 'min-w-fit', base: 'min-w-60', leadingIcon: `text-${options.find(kind => kind.value === selected)?.color}-500` }" />
    <UInput ref="filterInput" :model-value="query" @update:model-value="$emit('update:query', $event)"
      icon="i-lucide-search" type="text" placeholder="Filter...">
      <template #trailing>
        <UKbd value="F" />
      </template>
    </UInput>
  </div>
</template>
