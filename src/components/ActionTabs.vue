<script setup lang="ts">
import { type DefineComponent } from 'vue';

import ActionButton from './ActionButton.vue';

export interface Tab {
  icon: DefineComponent;
  component: DefineComponent;
}

defineProps<{ tabs: Tab[]; selectedIndex: number; updateIndex: (index: number) => void }>();
</script>

<template>
  <header v-if="tabs.length > 1">
    <ActionButton v-for="(_, index) in tabs" :key="index"
                  :class="['tab-button', { active: selectedIndex === index}]"
                  @click="updateIndex(index)"
    >
      <template #icon>
        <component :is="tabs[index].icon" class="reduced" />
      </template>
    </ActionButton>
  </header>
  <component :is="tabs[selectedIndex].component" />
</template>

<style scoped>
header {
  display: flex;
  border-bottom: 1px solid #000;
}
.tab-button {
  flex-grow: 1;
  position: relative;
}
.reduced {
  width: 15px;
}
.tab-button:not(:first-child)::before {
  content: "";
  left: 0;
  width: 1px;
  height: 16px;
  display: block;
  position: absolute;
  background-color: var(--secondary);
}
.tab-button:hover + .tab-button::before,
.tab-button.active + .tab-button::before {
  width: 0;
}
</style>
