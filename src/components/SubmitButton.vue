<template>
  <div class="submit-button">
    <slot />
  </div>
</template>

<style scoped>
.submit-button {
  height: 40px;
  display: flex;
  min-width: 40px;
  align-items: center;
  justify-content: center;
  user-select: none;
  cursor: pointer;
  font-weight: 700;
  box-sizing: border-box;
  pointer-events: auto;
  text-transform: uppercase;
  transition: all .3s ease;
  color: var(--primary);
  background-color: var(--secondary);
  border: 1px solid var(--secondary);
}
.submit-button:hover, .active {
  color: var(--secondary);
  background-color: var(--primary);
}
</style>
