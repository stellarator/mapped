<script setup lang="ts">
import { computed } from 'vue';

type Option = { id: string; text: string };
type Options = Option[] | (Option & { group: string })[];
type GroupedOption ={ group: string; items: Option[] };
type GroupedOptions = GroupedOption[] | Option[];
defineEmits<{ 'update:modelValue': [value: string] }>();

const props = defineProps<{ label: string; options: Options; modelValue: string }>();
const id = props.label.replace(/\s/g, '-').toLowerCase();
const groupedOptions = computed((): GroupedOptions => {
  if (props.options.length === 0 || !('group' in props.options[0])) {
    return props.options as unknown as Option[];
  }

  const grouped: { [key: string]: Option[] } = {};

  for (const { id, text, group } of props.options as unknown as (Option & { group: string })[]) {
    if (!grouped[group]) grouped[group] = [];
    grouped[group].push({ id, text });
  }

  return Object.keys(grouped).map(key => ({ group: key, items: grouped[key] }));
})
</script>

<template>
  <div class="selector-bar">
    <label :for="id">{{ label }}</label>
    <select :id="id" :value="modelValue" :disabled="!options.length"
            @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)">
      <template v-for="option in groupedOptions">
        <optgroup v-if="(option as GroupedOption).group"
                  :label="(option as GroupedOption).group"
                  :key="(option as GroupedOption).group"
        >
          <option v-for="item in (option as GroupedOption).items" :value="item.id" :key="item.id">
            {{ item.text }}
          </option>
        </optgroup>
        <option v-else :value="(option as Option).id" :key="(option as Option).id">
          {{ (option as Option).text }}
        </option>
      </template>
    </select>
  </div>
</template>

<style scoped>
.selector-bar {
  height: 49px;
  position: relative;
}
.selector-bar::after {
  left: 0;
  right: 0;
  content: "";
  display: block;
  border-bottom: 1px solid var(--secondary);
}
.selector-bar>label,
.selector-bar>select {
  display: block;
}
.selector-bar>label {
  font-weight: 500;
  margin: 7px 0 -7px;
}
.selector-bar>select {
  width: 100%;
  margin-top: 4px;
  padding-right: 24px;
  background-size: 13px;
  background-repeat: no-repeat;
  background-position: top 9px right 5px;
  background-image: var(--selector-image);
}
</style>
