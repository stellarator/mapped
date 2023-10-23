<script setup lang="ts">
</script>

<template>
  <div class="action-button">
    <slot name="icon" />
  </div>
</template>

<style scoped>
.action-button {
  width: 40px;
  height: 40px;
  display: flex;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  pointer-events: auto;
  color: var(--secondary);
  background-color: var(--primary);
}
.action-button:hover, .active {
  color: var(--primary);
  background-color: var(--secondary);
}
:slotted(svg) {
  width: 50%;
  height: 50%;
}
</style>
