<script setup lang="ts">
import { computed, inject, ref, type ShallowRef } from 'vue';
import type { Map as _Map } from 'mapbox-gl';

import SearchIcon from './icons/IconSearch.vue'
import MinimapIcon from './icons/IconMinimap.vue';
import VisibilityOnIcon from './icons/IconVisibilityOn.vue';
import VisibilityOffIcon from './icons/IconVisibilityOff.vue';
import type { Actions } from '../map.js';

const map = inject<ShallowRef<_Map | null>>('map');
const mapActions = inject<Actions>('actions');

const filter = ref('');
const layers = computed(() => {
  const expression = filter.value?.toLowerCase() || '';
  return map?.value?.getStyle().layers.reverse()
    .filter(({ id }) => id !== 'drag-layer' && kebabToCapitalized(id).toLowerCase().includes(expression))
    .map(({ id }) => ({
      id,
      name: splitByPattern(kebabToCapitalized(id), expression),
      visible: map?.value?.getLayoutProperty(id, 'visibility') !== 'none',
    }));
});

const toggleLayer = (event: MouseEvent) => {
  mapActions?.toggleLayer((event.currentTarget as HTMLDivElement).dataset['id']);
  filter.value = filter.value + '#'; filter.value = filter.value.slice(0, -1); // trigger computed ref
};
</script>

<script lang="ts">
const kebabToCapitalized = (str: string) =>
  str.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
const splitByPattern = (str: string, pattern: string) => {
  const index = str.toLowerCase().indexOf(pattern);
  return [str.substring(0, index), str.substring(index, index + pattern.length), str.substring(index + pattern.length)];
}
</script>

<template>
  <div class="search-bar">
    <SearchIcon class="icon" />
    <input class="input" v-model="filter" placeholder="Search for an element">
  </div>
  <div class="content-bar">
    <div class="layer-container" v-for="layer in layers" :key="layer.id" :data-id="layer.id" @click="toggleLayer">
      <MinimapIcon class="icon" />
      <span :class="{ hidden: !layer.visible }">{{ layer.name[0] }}</span>
      <span :class="{ hidden: !layer.visible, pattern: true }">{{ layer.name[1] }}</span>
      <span :class="{ hidden: !layer.visible }">{{ layer.name[2] }}</span>
      <component :is="layer.visible ? VisibilityOnIcon : VisibilityOffIcon" class="icon" />
    </div>
  </div>
</template>

<style scoped>
.search-bar {
  height: 40px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--secondary);
}
.icon {
  width: 13px;
  height: 13px;
  flex-shrink: 0;
}
.search-bar>.icon {
  margin-left: 16px;
}
.input {
  flex-grow: 1;
  margin: 0 16px 0 8px;
}
.content-bar {
  padding: 16px 16px;
  max-height: 60vh;
}
.content-bar {
  overflow: hidden;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--secondary) transparent;
}
.content-bar::-webkit-scrollbar {
  width: 4px;
  background: transparent;
}
.content-bar::-webkit-scrollbar-thumb {
  background: var(--secondary);
}
.layer-container {
  height: 14px;
  display: flex;
  cursor: pointer;
  align-items: center;
  box-sizing: border-box;
  justify-content: space-between;
}
.layer-container:not(:first-child) {
  margin-top: 8px;
}
.layer-container>.icon:first-child {
  margin-right: 8px;
}
.layer-container>.icon:last-child {
  margin-left: 8px;
}
.layer-container>span {
  user-select: none;
  white-space: pre;
  overflow: hidden;
}
.layer-container>.pattern {
  color: var(--primary);
  background-color: var(--theme);
}
.layer-container>span:last-of-type {
  margin-right: auto;
  text-overflow: ellipsis;
}
.layer-container>span.hidden {
  text-decoration: line-through;
}
</style>
