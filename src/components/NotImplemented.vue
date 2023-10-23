<template>
  <div class="content-bar">
      <div class="content">
        <h2>NOT IMPLEMENTED</h2>
        <h2>NOT IMPLEMENTED</h2>
      </div>
  </div>
</template>

<style scoped>
.content-bar {
  padding: 30px;
  height: 38px;
  user-select: none;
  text-align: center;
  background-color: white;
}

.content {
  position: relative;
}

.content>h2 {
  margin: 0;
  width: 100%;
  font-size: 20px;
  position: absolute;
}

.content>h2:nth-child(1) {
  color: transparent;
  -webkit-text-stroke: 1px var(--greyed);
}

.content>h2:nth-child(2) {
  color: var(--greyed);
  animation: animate 4s ease-in-out infinite;
}

@keyframes animate {
  0%,
  100% {
    clip-path: polygon(
      0% 45%,
      16% 44%,
      33% 50%,
      54% 60%,
      70% 61%,
      84% 59%,
      100% 52%,
      100% 100%,
      0% 100%
    );
  }

  50% {
    clip-path: polygon(
      0% 60%,
      15% 65%,
      34% 66%,
      51% 62%,
      67% 50%,
      84% 45%,
      100% 46%,
      100% 100%,
      0% 100%
    );
  }
}</style>
