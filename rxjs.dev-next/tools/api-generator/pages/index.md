<script setup>
import { computed, ref } from 'vue';
import Search from '../../components/Search.vue'
import ApiSection, { kindMappings, kindForUrl, urlToKind } from '../../components/ApiSection.vue'
import sidebar from '../api/typedoc-sidebar.json'

const allKinds = computed(() => {
  return [{ label: 'All', value: 'all', icon: 'i-lucide-list-check', color: 'neutral' }, ...Object.values(kindMappings)];
});

const selectedKind = ref(allKinds.value[0].value);
const query = ref('');

const flattenItems = (items = []) => items.flatMap(item => item.items?.length ? flattenItems(item.items) : item.link ? [item] : []);

const sections = computed(() => sidebar
  .filter(section => section.items?.length)
  .map(section => ({ text: section.text, items: filterItems(flattenItems(section.items)) }))
  .filter(section => section.items.length));

const filterItems = (items) => {
  const q = query.value.toLowerCase().trim();
  const shouldFilterByKind = selectedKind.value !== 'all';
  const shouldFilterByQuery = q !== '';

  let _items = items;

  _items = shouldFilterByKind ?
    _items.filter(item => kindForUrl(item.link) === selectedKind.value) :
    _items;

  _items = shouldFilterByQuery ?
    _items.filter(item => item.text.toLowerCase().includes(q)) :
    _items;

  return _items;
}
</script>

# RxJS API Explorer

## Explorer

<Search v-model:query="query" v-model:selected="selectedKind" :selectOptions="allKinds" />

<template v-for="section in sections" :key="section.text">
  <h3>{{ section.text }}</h3>
  <ApiSection :items="section.items" />
</template>
