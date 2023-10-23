<script setup lang="ts">
import type { Map as _Map } from 'mapbox-gl';
import { computed, inject, ref, watch, type ShallowRef } from 'vue';
import type { Actions, Dimensions } from '../map.js';
import { saveImage, TOOLBAR_HEIGHT } from '../utils.js';
import SubmitButton from './SubmitButton.vue';
import SelectorBar from './SelectorBar.vue';
import InputField from './InputFieldV.vue';

const map = inject<ShallowRef<_Map | null>>('map');
const mapActions = inject<Actions>('actions');
const mapDimensions = inject<Dimensions>('dimensions');

const selectedCreates = ref(savedCreates);
const selectedFormat = ref(savedFormat);
const selectedPreset = ref(savedPreset);
const selectedUnit = ref(savedUnit);
const selectedRes = ref(savedRes);

const resX = ref(savedResX);
const resY = ref(savedResY); // TODO fix asymmetric update ↴
const dpi = computed(() => Math.max(resX.value, resY.value));

const scale = computed(() => mapDimensions?.scale.value || 0);
const canvasWidth = computed(() => mapDimensions?.canvasWidth.value || 0);
const canvasHeight = computed(() => mapDimensions?.canvasHeight.value || 0);

const unitToPx = (num: number, unit = selectedUnit.value) => unit === 'px' ? num
  : unit === 'in' ? inToPx(num, dpi.value) : unit === 'mm' ? mmToPx(num, dpi.value) : cmToPx(num, dpi.value);
const pxToUnit = (num: number, unit = selectedUnit.value) => unit === 'px' ? num
  : unit === 'in' ? pxToIn(num, dpi.value) : unit === 'mm' ? pxToMm(num, dpi.value) : pxToCm(num, dpi.value);

const clampWidth = (width: number) => pxToUnit(Math.min(canvasWidth.value, unitToPx(width)));
const clampHeight = (height: number) => pxToUnit(Math.min(canvasHeight.value, unitToPx(height)));

const width = ref(clampWidth(savedWidth));
const height = ref(clampHeight(savedHeight));
const maxWidth = ref(pxToUnit(canvasWidth.value));
const maxHeight = ref(pxToUnit(canvasHeight.value));

watch(width, () => savedWidth = width.value);
watch(height, () => savedHeight = height.value);
watch(canvasWidth, () => {
  maxWidth.value = pxToUnit(canvasWidth.value);
  width.value = clampWidth(width.value);
})
watch(canvasHeight, () => {
  maxHeight.value = pxToUnit(canvasHeight.value);
  height.value = clampHeight(height.value);
})

watch(selectedCreates, () => savedCreates = selectedCreates.value);
watch(selectedFormat, () => savedFormat = selectedFormat.value);
watch(selectedPreset, () => savedPreset = selectedPreset.value);
watch(selectedUnit, () => {
  maxWidth.value = pxToUnit(canvasWidth.value);
  maxHeight.value = pxToUnit(canvasHeight.value);
  width.value = clampWidth(pxToUnit(unitToPx(width.value, savedUnit)));
  height.value = clampHeight(pxToUnit(unitToPx(height.value, savedUnit)));
  savedUnit = selectedUnit.value;
});
watch(selectedRes, () => {
  if (selectedRes.value !== 'custom') {
    [resX.value, resY.value] = selectedRes.value.split('x').map(val => parseInt(val));
  }
  savedRes = selectedRes.value;
});
watch(resX, () => {
  maxWidth.value = pxToUnit(canvasWidth.value);
  width.value = clampWidth(pxToUnit(unitToPx(width.value)));
  maxHeight.value = pxToUnit(canvasHeight.value);
  height.value = clampHeight(pxToUnit(unitToPx(height.value)));
  savedResX = resX.value;
});
watch(resY, () => {
  maxHeight.value = pxToUnit(canvasHeight.value);
  height.value = clampHeight(pxToUnit(unitToPx(height.value)));
  maxWidth.value = pxToUnit(canvasWidth.value);
  width.value = clampWidth(pxToUnit(unitToPx(width.value)));
  savedResY = resY.value;
});

const top = computed(() =>
  ((canvasHeight.value || unitToPx(height.value)) - unitToPx(height.value))
  / (scale.value * 2) + TOOLBAR_HEIGHT + 'px'
);
const left = computed(() =>
  ((canvasWidth.value || unitToPx(width.value)) - unitToPx(width.value))
  / (scale.value * 2) + 'px'
);
const bottom = computed(() =>
  ((canvasHeight.value || unitToPx(height.value)) - unitToPx(height.value))
  / (scale.value * 2) + 'px'
);
const right = computed(() =>
  ((canvasWidth.value || unitToPx(width.value)) - unitToPx(width.value))
  / (scale.value * 2) + 'px'
);

const rounder = computed(() => getWholeOrPrecision.bind(null, selectedUnit.value === 'px' ? 0 : 2));
const isCustomRes = computed(() => selectedUnit.value !== 'px' && selectedRes.value === 'custom');
const isCustomUnit = computed(() => selectedUnit.value !== 'px');

const onSubmit = () => {
  mapActions?.toggleLayer('drag-layer');
  requestAnimationFrame(() => {
    saveImage(
      map?.value?.getCanvas() as HTMLCanvasElement,
      unitToPx(width.value),
      unitToPx(height.value),
      selectedFormat.value,
      selectedUnit.value !== 'px' ? resY.value / resX.value : 1,
    );
    mapActions?.toggleLayer('drag-layer');
  })
}
</script>

<script lang="ts">
const resolutions = [
  { id: '96x96', text: 'Classic Monitor (96 PPI)', group: 'Screen' },
  { id: '92x92', text: 'Full HD 24-inch (92 PPI)', group: 'Screen' },
  { id: '82x82', text: 'Full HD 27-inch (82 PPI)', group: 'Screen' },
  { id: '109x109', text: 'Quad HD 27-inch (109 PPI)', group: 'Screen' },
  { id: '92x92', text: 'Quad HD 32-inch (92 PPI)', group: 'Screen' },
  { id: '163x163', text: 'Ultra HD 27-inch (163 PPI)', group: 'Screen' },
  { id: '138x138', text: 'Ultra HD 32-inch (138 PPI)', group: 'Screen' },
  { id: '218x218', text: '5K 27-inch (218 PPI)', group: 'Screen' },
  { id: '275x275', text: '8K 32-inch (275 PPI)', group: 'Screen' },
  { id: '110x110', text: 'Ultrawide 34-inch (110 PPI)', group: 'Screen' },
  { id: '108x108', text: 'Super Ultrawide 49-inch (108 PPI)', group: 'Screen' },

  { id: '326x326', text: 'Early Retina iPhones (326 PPI)', group: 'Apple Devices' },
  { id: '401x401', text: 'iPhone Plus models (401 PPI)', group: 'Apple Devices' },
  { id: '458x458', text: 'iPhone X, XS, 11 Pro (458 PPI)', group: 'Apple Devices' },
  { id: '264x264', text: 'Most Retina iPads (264 PPI)', group: 'Apple Devices' },
  { id: '227x227', text: 'MacBook Air Retina (227 PPI)', group: 'Apple Devices' },
  { id: '218x218', text: 'iMac with Retina (218 PPI)', group: 'Apple Devices' },

  { id: '300x300', text: 'Entry-level (300 x 300 DPI)', group: 'Printer' },
  { id: '600x600', text: 'Basic model (600 x 600 DPI)', group: 'Printer' },
  { id: '1200x1200', text: 'Basic model (1200 x 1200 DPI)', group: 'Printer' },
  { id: '2400x2400', text: 'Professional (2400 x 2400 DPI)', group: 'Printer' },
  { id: '2880x1440', text: 'Professional (2880 x 1440 DPI)', group: 'Printer' },
  { id: '4800x1200', text: 'Photo-focused (4800 x 1200 DPI)', group: 'Printer' },
  { id: '9600x2400', text: 'Photo-focused (9600 x 2400 DPI)', group: 'Printer' },

  { id: 'custom', text: 'Custom DPI/PPI', group: 'Custom' },
];
const creates = [
  { id: 'static', text: 'Static' },
];
const formats = [
  { id: 'image/png', text: 'PNG' },
  { id: 'image/jpeg', text: 'JPG' },
];
const presets = [
] as { id: string; text: string }[];
const units = [
  { id: 'mm', text: 'Millimetres' },
  { id: 'cm', text: 'Centimetres' },
  { id: 'in', text: 'Inches' },
  { id: 'px', text: 'Pixels' },
];

const pxToMm = (px: number, dpi: number) => Math.round(px * 25.4 / dpi * 100) / 100;
const mmToPx = (mm: number, dpi: number) => Math.round(mm * dpi / 25.4);
const pxToCm = (px: number, dpi: number) => Math.round(px * 2.54 / dpi * 100) / 100;
const cmToPx = (cm: number, dpi: number) => Math.round(cm * dpi / 2.54);
const pxToIn = (px: number, dpi: number) => Math.round(px / dpi * 100) / 100;
const inToPx = (im: number, dpi: number) => Math.round(im * dpi);

const getWholeOrPrecision = (p: number, num: number) =>
  p > 0 && Number.isInteger(num) ? num.toString() : num.toFixed(p);

let savedResX = 100;
let savedResY = 100;
let savedWidth = 600;
let savedHeight = 400;

let savedCreates = String(creates[creates.length - 1].id);
let savedFormat = String(formats[formats.length - 1].id);
let savedPreset = String(presets[presets.length - 1]?.id);
let savedUnit = String(units[units.length - 1].id);
let savedRes = String(resolutions[resolutions.length - 1].id);
</script>

<template>
  <SelectorBar class="selector-bar" :options="creates" label="Create" v-model="selectedCreates"/>
  <SelectorBar class="selector-bar" :options="formats" label="Format" v-model="selectedFormat"/>
  <SelectorBar class="selector-bar" :options="presets" label="Preset" v-model="selectedPreset"/>
  <SelectorBar class="selector-bar" :options="units" label="Unit" v-model="selectedUnit"/>
  <div class="dimensions">
    <InputField :value="width" :min="1" :max="maxWidth" :rounder="rounder"
                @change="(w) => width = w">Width</InputField>
    <div class="divider">x</div>
    <InputField :value="height" :min="1" :max="maxHeight" :rounder="rounder"
                @change="(h) => height = h">Height</InputField>
  </div>
  <SelectorBar v-show="isCustomUnit"
               class="selector-bar" :options="resolutions" label="Output device" v-model="selectedRes"
  />
  <div v-show="isCustomRes" class="dimensions">
    <InputField :value="resX" :min="1" :rounder="(num: number) => getWholeOrPrecision(0, num)"
                @change="(x) => resX = x">X-Res</InputField>
    <div class="divider">x</div>
    <InputField :value="resY" :min="1" :rounder="(num: number) => getWholeOrPrecision(0, num)"
                @change="(y) => resY = y">Y-Res</InputField>
  </div>
  <SubmitButton class="button" @click="onSubmit">Download</SubmitButton>
  <div class="selection" :style="{ top, left, bottom, right }"></div>
</template>

<style scoped>
.selector-bar {
  padding: 0 30px;
}
.selector-bar:first-child {
  padding-top: 30px;
}
.selector-bar:nth-last-child(2) {
  padding-bottom: 30px;
}
.dimensions {
  display: flex;
  padding: 0 30px;
  justify-content: space-between;
}
.dimensions>* {
  flex-grow: 1;
}
.divider {
  flex-grow: 0;
  align-self: end;
  padding: 0 8px 0;
}
.button {
  margin: 16px 30px 30px;
}
.selection {
  z-index: -1;
  position: fixed;
  pointer-events: none;
  background-color: #a0a0a040;
}
</style>
