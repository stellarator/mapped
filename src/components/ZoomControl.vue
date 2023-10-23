<script setup lang="ts">
import ZoomInIcon from './icons/IconZoomIn.vue';
import ZoomOutIcon from './icons/IconZoomOut.vue';
import ActionButton from './ActionButton.vue';

import { type Map as _Map } from 'mapbox-gl';

defineProps<{ map: _Map | null }>();
</script>

<template>
  <div class="zoom-control popup" data-descr="Click to change the zoom level, or scroll the map">
    <ActionButton class="toolbar-button" @click="map?.zoomIn()">
      <template #icon>
        <ZoomInIcon />
      </template>
    </ActionButton>
    <ActionButton class="toolbar-button" @click="map?.zoomOut()">
      <template #icon>
        <ZoomOutIcon />
      </template>
    </ActionButton>
  </div>
</template>

<style scoped>
.zoom-control {
  margin: 0 16px 0 10px;
  align-items: center;
  display: flex;
  height: 100%;
  position: relative;
}
.toolbar-button {
  width: 30px;
  height: 30px;
  border: 1px solid #dee2e6;
  margin-bottom: 1px; /* ? */
  box-shadow: none;
}
.toolbar-button:not(:first-child) {
  border-left: none;
  width: 29px;
}
.popup:hover::before {
  transform: translate(24px, 22px);
}
.popup:hover::after {
  transform: translate(-82px, 50px);
}
</style>
