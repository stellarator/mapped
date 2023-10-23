<script setup lang="ts">
import { computed, inject, onBeforeUnmount, ref, shallowRef, watch, type ShallowRef } from 'vue';
import type { Icon } from '../utils.js';
import type { Map as _Map } from 'mapbox-gl';
import type { Actions, Modes } from '../map.js';

import SearchIcon from './icons/IconSearch.vue'
import SelectorBar from './SelectorBar.vue';
import LoadingGrid from './LoadingGrid.vue';

// Component state
// used in corner case when component is unmounting but data is still fetching
let unmounted = false; onBeforeUnmount(() => { unmounted = true });

const map = inject<ShallowRef<_Map | null>>('map');
const mapModes = inject<Modes>('modes');
const mapActions = inject<Actions>('actions');

const filter = ref('');
const selected = ref(savedSelected);
const content = shallowRef<Icon[] | null>(getOrFetch());
const icons = computed(() => {
  const expression = filter.value?.toLowerCase() || '';
  return content.value?.filter(({ lcName }) => lcName.includes(expression));
});

const onDataFetch = ([setId, icons]: [string, Icon[]]) => {
  if (!unmounted && selected.value === setId) content.value = icons;
};
const updateOnFetch = () => {
  if (!content.value) (contents.get(savedSelected) as Promise<[string, Icon[]]>)?.then(onDataFetch);
};
const createLabel = async (event: MouseEvent) => {
  const id = (event.currentTarget as HTMLDivElement).dataset['id'];
  const icon = icons.value?.find(icon => icon.id == id);
  if (map?.value && icon) {
    const iconId = await mapActions?.addIcon(icon);
    const { lng, lat } = map.value.getCenter();
    mapActions?.createItem({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [lng, lat],
      },
      properties: {
        icon: iconId,
        text: '',
        id,
      },
      id: Date.now()
    });
  }
};

updateOnFetch();
watch(selected, () => {
  savedSelected = selected.value;
  content.value = getOrFetch();
  updateOnFetch();
});
</script>

<script lang="ts">
import { loadIconSet, parseIconSet } from '../utils.js';

const iconSets = [
  { id: '3', text: 'Mapcreator Icons' },
  { id: '5006', text: 'POI Layer Icons' },
]

let contents = new Map<string, Icon[] | Promise<[string, Icon[]]>>();
let savedSelected = iconSets[0].id;

function getOrFetch(): Icon[] | null {
  if (contents.has(savedSelected)) {
    const content = contents.get(savedSelected) as Icon[];
    if (!('then' in content)) return content;
  } else {
    contents.set(
      savedSelected,
      (loadIconSet(savedSelected).then(([setId, iconSet]) => {
        const icons = parseIconSet(setId, iconSet);
        contents.set(setId, icons);
        return [setId, icons];
      }) as Promise<[string, Icon[]]>)
    );
  }

  return null;
}
</script>

<template>
  <div class="search-bar">
    <SearchIcon class="icon" />
    <input class="input" v-model="filter" placeholder="Search">
  </div>
  <SelectorBar class="selector-bar" :options="iconSets" label="SVG set" v-model="selected"/>
  <Transition>
    <div class="content-bar" v-show="!mapModes?.dragMode.value">
      <LoadingGrid v-if="!icons" />
      <div v-else class="content">
        <div class="icon-container" v-for="icon in icons" :key="icon.id"
             :data-id="icon.id"
             v-html="icon.svg"
             @click="createLabel"
        ></div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.search-bar {
  height: 48px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--secondary);
}
.icon {
  width: 20px;
  height: 20px;
  margin-left: 16px;
}
.input {
  flex-grow: 1;
  margin: 0 16px 0 8px;
}
.selector-bar {
  padding: 0 30px;
}
.selector-bar::after {
  position: absolute;
}
.content-bar {
  padding: 30px;
  max-height: 40vh;
  display: flex;
  flex-flow: column;
  background-color: white;
}
.content {
  margin: -4px;
  padding-right: 4px;
  overflow: hidden;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--secondary) transparent;
  display: flex;
  flex-flow: row wrap;
  justify-content: flex-start;
}
.content::-webkit-scrollbar {
  width: 4px;
  background: transparent;
}
.content::-webkit-scrollbar-thumb {
  background: var(--secondary);
}
.icon-container {
  height: 34px;
  margin: 0 4px 4px 0;
  cursor: move;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  flex-basis: calc(20% - 4px);
  border: 1px solid var(--secondary);
}
:global(.icon-container svg) {
  width: 20px;
  height: 20px;
}

.v-enter-active {
  transition: opacity 0.15s ease-in;
}
.v-leave-active {
  transition: opacity 0.05s ease-out;
}
.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
