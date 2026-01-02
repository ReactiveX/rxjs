<script lang="ts">
export const kindForUrl = (url: string) => {
  const kindRe = /\/api\/.+\/(.+)\//;
  return kindRe.exec(url)?.[1]!;
};

export const kindMappings = {
  functions: {
    icon: 'i-lucide-code',
    color: 'success',
    label: 'Functions',
    value: 'functions',
  },
  classes: {
    icon: 'i-lucide-box',
    color: 'info',
    label: 'Classes',
    value: 'classes',
  },
  variables: {
    icon: 'i-lucide-key',
    color: 'primary',
    label: 'Variables',
    value: 'variables',
  },
  enumerations: {
    icon: 'i-lucide-list-check',
    color: 'warning',
    label: 'Enumerations',
    value: 'enumerations',
  },
  interfaces: {
    icon: 'i-lucide-layout-dashboard',
    color: 'neutral',
    label: 'Interfaces',
    value: 'interfaces',
  },
  'type-aliases': {
    icon: 'i-lucide-type',
    color: 'error',
    label: 'Type Aliases',
    value: 'type-aliases',
  },
}

export const urlToKind = (url: string) => {
  return kindMappings[kindForUrl(url)];
}
</script>

<script setup lang="ts">
defineProps<{
  items: any[];
}>();


const makePageLinks = (items: any[]) => {
  return items.map((item: any) => {
    const kind = urlToKind(item.link);
    return {
      label: item.text,
      to: item.link.replace('.md', ''),
      icon: kind?.icon,
      color: kind?.color,
    };
  });
}
</script>

<template>
  <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8" v-show="items.length > 0">
    <UButton v-for="item in makePageLinks(items)" :key="item.label" :to="item.to" :color="item.color" variant="soft"
      :icon="item.icon" class="w-full min-w-0 justify-start" :ui="{ base: 'min-w-0', leadingIcon: 'shrink-0' }">
      <span class="min-w-0 flex-1 truncate">
        {{ item.label }}
      </span>
    </UButton>
  </div>
</template>

<style scoped>
:deep(ul) {
  list-style: none !important;
  margin-left: 0 !important;
  margin-right: 0 !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
}

:deep(a) {
  color: revert-layer !important;
  text-decoration: none !important;
}
</style>
