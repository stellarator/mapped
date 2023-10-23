<script setup lang="ts">
import LogoIcon from './icons/IconLogo.vue';
import TiltIcon from './icons/IconTilt.vue';
import RotationIcon from './icons/IconRotation.vue';

import ZoomControl from './ZoomControl.vue';
import InputField from './InputFieldH.vue';

import type { Map } from '../map.js';

const props = defineProps<Map>();

const inputs = [
  {
    min: 0.5, max: 22, precision: 1,
    prop: 'zoom', label: 'Zoom',
    onChange: (val: number) => props.map?.setZoom(val),
    hint: 'Click to change the zoom level, or scroll the map',
  },
  {
    min: 0, max: 85, precision: 1,
    prop: 'pitch', label: 'Tilt', icon: TiltIcon,
    onClick: () => props.map?.easeTo({ pitch: 0 }),
    onChange: (val: number) => props.map?.setPitch(val),
    hint: '',
  },
  {
    min: -180, max: 180, precision: 1,
    prop: 'bearing', label: 'Rotation', icon: RotationIcon,
    onClick: () => props.map?.resetNorth(),
    onChange: (val: number) => props.map?.setBearing(val),
    hint: '',
  },
  {
    min: -90, max: 90, precision: 2,
    prop: 'lat', label: 'Lat',
    onChange: (val: number) => props.map?.setCenter({ lng: props.lng, lat: val }),
    hint: '',
  },
  {
    min: -180, max: 180, precision: 2,
    prop: 'lng', label: 'Long',
    onChange: (val: number) => props.map?.setCenter({ lng: val, lat: props.lat }),
    hint: '',
  },
];
</script>

<script lang="ts">
// Maps pitch value into (pitch) icon height
function mapPitch(value: number) {
  // The range of pitch values
  const pitchMin = 0;
  const pitchMax = 85;
  // The range of icon heights
  const heightMin = 1;
  const heightMax = 12;

  // Use generic formula just in case, can be simplified for `pitchMin = 0` case
  const newValue = ((value - pitchMin) / (pitchMax - pitchMin)) * (heightMin - heightMax) + heightMax;
  // Covers corner cases with potential out-of-bounds values
  return Math.min(heightMax, Math.max(heightMin, newValue)) + 'px';
}

// Maps bearing value into (bearing) icon rotation transform
function mapBearing(value: number) { return `rotate(${-value}deg)` }
</script>

<template>
  <header class="toolbar">
    <div class="logo"><LogoIcon /></div>
    <ZoomControl :map="map"/>

    <InputField v-for="input in inputs" :key="input.prop"
                :value="$props[input.prop as keyof Map] as number"
                :min="input.min" :max="input.max" :precision="input.precision"
                :data-descr="input.hint"
                @change="input.onChange"
                @click="input.onClick"
    >
      <template #icon v-if="input.icon">
        <component :is="input.icon" class="action-icon"
                   :style="input.prop === 'pitch' ? {
                      height: mapPitch(pitch)
                   } : {
                      transform: mapBearing(bearing)
                   }"
        />
      </template>
      <template #label>{{ input.label + ':' }}</template>
    </InputField>
  </header>
</template>

<style scoped>
.toolbar {
  height: var(--toolbar-height);
  display: flex;
  align-items: center;
  pointer-events: auto;
  box-shadow: 0 3px 6px #00000029;
}
.logo {
  height: 100%;
  width: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #000;
  cursor: pointer;
  color: #fff;
}
.logo:hover {
  background-color: #343a40;
}
.action-icon {
  color: #ced4da;
}
:deep(.icon.active)>.action-icon {
  color: #ff5c5c;
}
</style>
