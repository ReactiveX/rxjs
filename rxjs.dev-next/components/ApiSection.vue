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
  <div class="api-grid" v-show="items.length > 0">
    <a v-for="item in makePageLinks(items)" :key="item.label" :href="item.to" class="api-card">
      <span>{{ item.label }}</span>
    </a>
  </div>
</template>

<style scoped>
.api-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  margin-top: 2rem;
}

.api-card {
  min-width: 0;
  overflow: hidden;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 0.7rem 0.9rem;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-brand-1) !important;
  font-weight: 600;
  text-decoration: none !important;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.api-card:hover {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}

@media (min-width: 768px) {
  .api-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

:deep(ul) {
  list-style: none !important;
  margin-left: 0 !important;
  margin-right: 0 !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
}

</style>
