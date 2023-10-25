<script setup lang="ts">
import { inject, ref, watch, shallowRef, type ShallowRef } from 'vue';
import type { Actions, MapItem } from '../map.js';
import SubmitButton from './SubmitButton.vue';
import { debounce } from '../utils.js';

const selected = inject<ShallowRef<MapItem | undefined>>('selected');
const mapActions = inject<Actions>('actions');

const getText = () => selected?.value?.properties?.text || '';
const getIcon = () => selected?.value?.properties?.icon && mapActions?.getIcon(selected.value.properties.id);

const input = ref(getText());
const icon = shallowRef(getIcon());

const textUpdate = debounce(() => {
  const item = selected?.value;
  if (item && item.properties!.text !== input.value) {
    mapActions?.updateItem(mapActions?.buildItem({
      coordinates: item.geometry.coordinates,
      properties: {...item.properties, text: input.value || ' ' },
      id: item.id,
    }));
  }
});

watch(input, textUpdate);
watch(selected!, () => {
  input.value = getText();
  icon.value = getIcon();
});

const deleteLabel = () => {
  if (selected?.value) mapActions?.deleteItem(selected.value);
};
</script>

<template>
  <div v-if="!icon" class="input-field">
    <label for="label-input" class="label">Label</label>
    <input id="label-input" class="input" v-model="input">
  </div>
  <div v-else class="icon-field">
    <label class="label">Symbol</label>
    <div class="icon" v-html="icon.svg" />
    <div class="spacer" />
  </div>
  <SubmitButton class="button" @click="deleteLabel">Delete</SubmitButton>
</template>

<style scoped>
.input-field,
.icon-field {
  height: 49px;
  position: relative;
  margin: 23px 30px 0;
  box-sizing: border-box;
  border-bottom: 0.5px solid var(--secondary);
}
.label, .input {
  display: block;
}
.label {
  font-weight: 500;
  margin: 7px 0 -3px;
}
.input {
  width: 100%;
  position: relative;
}
.icon {
  right: 0;
  bottom: 8px;
  padding: 2px;
  width: 20px;
  height: 20px;
  position: absolute;
  border: 2px solid var(--secondary);
}
.icon>:deep(svg) {
  width: 100%;
  height: 100%;
}
.button {
  margin: 16px 30px 30px;
}
.button:hover {
  color: var(--primary);
  border-color: var(--theme);
  background-color: var(--theme);
}
</style>
