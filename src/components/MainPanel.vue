<script setup lang="ts">
import SearchIcon from './icons/IconSearch.vue';
import AddElementsIcon from './icons/IconAddElements.vue';
import ElementListIcon from './icons/IconElementsList.vue';
import BaseSettingsIcon from './icons/IconBaseSettings.vue';
import ExportIcon from './icons/IconExport.vue';
import RollbackIcon from './icons/IconRollback.vue';

import SearchWorldIcon from './icons/IconSearchWorld.vue';
import SearchAreaIcon from './icons/IconSearchArea.vue';

import IconsIcon from './icons/IconIcons.vue';
import LabelsIcon from './icons/IconLabels.vue';
import LinesIcon from './icons/IconLines.vue';
import AreasIcon from './icons/IconAreas.vue';
import AdornmentsIcon from './icons/IconAdornments.vue';
import DataLayersIcon from './icons/IconDataLayers.vue';
import ImportIcon from './icons/IconImport.vue';

import BasePanel, { type Action } from './BasePanel.vue';
import NotImplemented from './NotImplemented.vue';
import ElementsList from './ElementsList.vue';
import ExportImage from './ExportImage.vue';
import IconsTab from './IconsTab.vue';
import LabelsTab from './LabelsTab.vue';

const actions = [
  {
    icon: SearchIcon,
    tabs: [
      {
        icon: SearchWorldIcon,
        component: NotImplemented,
      },
      {
        icon: SearchAreaIcon,
        component: NotImplemented,
      },
    ],
  },
  {
    icon: AddElementsIcon,
    tabs: [
      {
        icon: IconsIcon,
        component: IconsTab,
      },
      {
        icon: LabelsIcon,
        component: LabelsTab,
      },
      {
        icon: LinesIcon,
        component: NotImplemented,
      },
      {
        icon: AreasIcon,
        component: NotImplemented,
      },
      {
        icon: AdornmentsIcon,
        component: NotImplemented,
      },
      {
        icon: DataLayersIcon,
        component: NotImplemented,
      },
      {
        icon: ImportIcon,
        component: NotImplemented,
      },
    ],
  },
  {
    icon: ElementListIcon,
    tabs: [
      {
        icon: ElementListIcon,
        component: ElementsList,
      },
    ],
  },
  {
    icon: BaseSettingsIcon,
    tabs: [
      {
        icon: BaseSettingsIcon,
        component: NotImplemented,
      },
    ],
  },
  {
    icon: ExportIcon,
    tabs: [
      {
        icon: ExportIcon,
        component: ExportImage,
      },
    ],
  },
  // {
  //   icon: RollbackIcon,
  //   tabs: [],
  // }
] as Action[];
</script>

<template>
  <BasePanel :actions="actions" />
</template>

<style scoped>
.side-panel {
  flex-direction: row;
}
</style>
