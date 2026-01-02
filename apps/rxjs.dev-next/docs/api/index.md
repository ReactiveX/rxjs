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

const observableItems = computed(() => filterItems(sidebar, '@rxjs/observable'))
const ajaxItems = computed(() => filterItems(sidebar, 'ajax'))
const fetchItems = computed(() => filterItems(sidebar, 'fetch'))
const operatorsItems = computed(() => filterItems(sidebar, 'operators'))
const rxjsItems = computed(() => filterItems(sidebar, 'rxjs'))
const testingItems = computed(() => filterItems(sidebar, 'testing'))
const webSocketItems = computed(() => filterItems(sidebar, 'webSocket'))

const filterItems = (_sidebar, text) => {
  const q = query.value.toLowerCase().trim();
  const shouldFilterByKind = selectedKind.value !== 'all';
  const shouldFilterByQuery = q !== '';

  let _items = _sidebar.find(section => section.text === text)?.items ?? [];

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

## All Modules

- [@rxjs/observable](@rxjs/observable/index.md)
- [ajax](ajax/index.md)
- [fetch](fetch/index.md)
- [operators](operators/index.md)
- [rxjs](rxjs/index.md)
- [testing](testing/index.md)
- [webSocket](webSocket/index.md)

## Explorer

<Search v-model:query="query" v-model:selected="selectedKind" :selectOptions="allKinds" />

### RxJS (index)

<ApiSection :items="rxjsItems" />

### @rxjs/observable

<ApiSection :items="observableItems" />

### Ajax

<ApiSection :items="ajaxItems" />

### Fetch

<ApiSection :items="fetchItems" />

### Operators

<ApiSection :items="operatorsItems" />

### Testing

<ApiSection :items="testingItems" />

### Web Socket

<ApiSection :items="webSocketItems" />
