<script setup lang="ts">
import { computed, ref, watch } from 'vue';

const props = defineProps<{ value: number; precision: number; min: number; max: number }>();
const emit = defineEmits<{ change: [change: number], click: [] }>();

const inputId = Date.now().toString(36);
const savedValue = ref(getWholeOrPrecision(props.precision, props.value));
const inputValue = ref(getWholeOrPrecision(props.precision, props.value));
const isInvalid = computed(
  () => isNaN(+inputValue.value) || props.min > +inputValue.value || +inputValue.value > props.max
);

const processInput = (event: Event) => {
  (event.target as HTMLInputElement).value = savedValue.value;

  if (!isInvalid.value) {
    emit('change', +inputValue.value);
  } else {
    inputValue.value = savedValue.value;
  }
}

watch(props, () => { savedValue.value = inputValue.value = getWholeOrPrecision(props.precision, props.value) });
</script>

<script lang="ts">
const getWholeOrPrecision = (p: number, num: number) =>
  p === 1 && Number.isInteger(num) ? num.toString() : num.toFixed(p);
</script>

<template>
  <div class="input-field">
    <div v-if="$slots.icon" :class="['icon', value !== 0 ? 'active' : '']" @click="$emit('click')">
      <slot name="icon" />
    </div>
    <label :for="inputId" class="label">
      <slot name="label" />
    </label>
    <input :class="['input', { extended: precision > 1, invalid: isInvalid, popup: !!$attrs['data-descr'] }]"
           :id="inputId" :data-descr="$attrs['data-descr']"
           @change="processInput"
           v-model="inputValue"
    >
  </div>
</template>

<style scoped>
.input-field {
  height: 24px;
  display: flex;
  align-items: center;
  box-sizing: border-box;
}
.input-field:not(:last-child) {
  margin-right: 8px;
}
.icon {
  width: 24px;
  height: 100%;
  padding-bottom: 7px;
  box-sizing: border-box;

  display: flex;
  align-items: flex-end;
  justify-content: center;
}
.icon.active {
  cursor: pointer;
}
.label {
  color: var(--subtitle);
  font-weight: 300;
}
.input {
  width: 36px;
  text-align: center;
  position: relative;
  border-bottom: 0.5px solid #ced4da;
}
.extended {
  width: 90px;
}
.invalid {
  border-bottom-color: #ff0000;
}
</style>
