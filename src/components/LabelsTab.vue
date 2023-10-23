<script setup lang="ts">
import { inject, ref, type ShallowRef } from 'vue';
import type { Actions } from '../map.js';
import type { Map as _Map } from 'mapbox-gl';
import SubmitButton from './SubmitButton.vue';

const map = inject<ShallowRef<_Map | null>>('map');
const mapActions = inject<Actions>('actions');

const input = ref('');

const createLabel = async (event: MouseEvent) => {
  if (map?.value && input.value) {
    const { lng, lat } = map.value.getCenter();
    mapActions?.createItem({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [lng, lat],
      },
      properties: {
        icon: '',
        text: input.value,
        id: input.value,
        textSize: 24,
      },
      id: Date.now()
    });
    input.value = '';
  }
};
</script>

<template>
  <div class="input-field">
    <label for="label-input" class="label">Label</label>
    <input id="label-input" class="input" v-model="input">
  </div>
  <SubmitButton class="button" @click="createLabel">Add Label to Map</SubmitButton>
</template>

<style scoped>
.input-field {
  height: 49px;
  margin: 23px 30px 0;
  box-sizing: border-box;
}
.label, .input {
  display: block;
}
.label {
  font-weight: 500;
  margin: 7px 0 -2px;
}
.input {
  width: 100%;
  position: relative;
  border-bottom: 0.5px solid var(--secondary);
}

.button {
  margin: 16px 30px 30px;
}
</style>
