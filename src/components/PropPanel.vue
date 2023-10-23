<script setup lang="ts">
import StylingIcon from './icons/IconStyling.vue';
import LocationIcon from './icons/IconLocation.vue';

import BasePanel, { type Action } from './BasePanel.vue';
import NotImplemented from './NotImplemented.vue';
import EditLabel from './EditLabel.vue';

const actions = [
  {
    icon: StylingIcon,
    tabs: [
      {
        icon: StylingIcon,
        component: EditLabel,
      },
    ],
  },
  {
    icon: LocationIcon,
    tabs: [
      {
        icon: LocationIcon,
        component: NotImplemented,
      },
    ],
  },
] as unknown as Action[];
</script>

<template>
  <BasePanel :actions="actions" :initial-index="0" />
</template>

<style scoped>
.side-panel {
  flex-direction: row-reverse;
}
</style>
