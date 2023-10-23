<script setup lang="ts">
import { computed, ref, watch } from 'vue';

const props = defineProps<{ value: number; min?: number; max?: number; rounder?: (n: number) => string }>();
const emit = defineEmits<{ change: [change: number] }>();

const formatValue = () => props.rounder?.(props.value) ?? props.value.toString();

const inputId = Date.now().toString(36);
const savedValue = ref(formatValue());
const inputValue = ref(formatValue());
const isInvalid = computed(
  () => isNaN(+inputValue.value)
    || props.min && props.min > (props.rounder ? +props.rounder(+inputValue.value) : +inputValue.value)
    || props.max && (props.rounder ? +props.rounder(+inputValue.value) : +inputValue.value) > props.max
);

const processInput = (event: Event) => {
  (event.target as HTMLInputElement).value = savedValue.value;

  if (!isInvalid.value) {
    emit('change', props.rounder ? +props.rounder(+inputValue.value) : +inputValue.value);
  } else {
    inputValue.value = savedValue.value;
  }
}

watch(props, () => { savedValue.value = inputValue.value = formatValue() });
</script>

<template>
  <div class="input-field">
    <label :for="inputId" class="label"><slot /></label>
    <input :class="['input', { invalid: isInvalid }]"
           :id="inputId" :data-descr="$attrs['data-descr']"
           @change="processInput"
           v-model="inputValue"
    >
  </div>
</template>

<style scoped>
.input-field {
  height: 49px;
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
.invalid {
  border-bottom-color: #ff0000;
}
</style>
