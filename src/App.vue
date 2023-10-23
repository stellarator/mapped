<script setup lang="ts">
import { provide } from 'vue';
import { useMap } from './map.js';
import ToolBar from './components/ToolBar.vue';
import MainPanel from './components/MainPanel.vue';
import PropPanel from './components/PropPanel.vue';

const { map, lng, lat, zoom, pitch, bearing, selected, modes, actions, dimensions } = useMap('map');

provide('map', map);

provide('modes', modes);
provide('selected', selected);

provide('actions', actions);
provide('dimensions', dimensions);
</script>

<template>
  <ToolBar v-bind="{ map, lng, lat, zoom, pitch, bearing }" />
  <section class="control-plane">
    <MainPanel />
    <PropPanel v-if="modes.editMode.value" />
  </section>
</template>

<style>
.control-plane {
  margin: 16px;
  display: flex;
  justify-content: space-between;
}
.side-panel {
  display: flex;
  align-items: flex-start;
}
.side-panel>section {
  display: flex;
  flex-direction: column;
}
</style>
