<script setup lang="ts">
import { ref, type DefineComponent } from 'vue';

import ActionTabs, { type Tab } from './ActionTabs.vue';
import ActionButton from './ActionButton.vue';

export interface Action {
  icon: DefineComponent;
  tabs: Tab[];
}

const props = defineProps<{ actions: Action[], initialIndex?: number }>();

const activeIndex = ref(props.initialIndex ?? -1);
const selectedTab = ref(props.actions.map(() => 0));
const updateIndex = (index: number) => selectedTab.value[activeIndex.value] = index;
</script>

<template>
  <aside class="side-panel">
    <section class="action-menu">
      <ActionButton v-for="(action, index) in actions" :key="index"
                    :class="['menu-button', { active: activeIndex === index}]"
                    @click="activeIndex = activeIndex === index ? -1 : index"
      >
        <template #icon>
          <component :is="action.icon" />
        </template>
      </ActionButton>
      <slot />
    </section>
    <section class="context-menu" v-if="activeIndex >= 0">
      <ActionTabs :tabs="actions[activeIndex].tabs as Tab[]"
                  :selected-index="selectedTab[activeIndex]"
                  :update-index="updateIndex"
      />
    </section>
  </aside>
</template>

<style scoped>
.context-menu {
  width: 250px;
  margin-left: 8px;
  margin-right: 8px;
  pointer-events: auto;
  box-shadow: 0 3px 6px #00000029;
  background-color: var(--primary);
}
.menu-button {
  margin-bottom: 8px;
  box-shadow: 0 3px 6px #00000029;
}
</style>
