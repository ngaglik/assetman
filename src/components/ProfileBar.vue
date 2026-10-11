<template>
  <n-dropdown trigger="hover" :options="options" @select="handleSelect">
    <n-button text type="primary">
      {{ userName }}
      <template #icon>
        <n-icon><PersonCircleOutline /></n-icon>
      </template>
    </n-button>
  </n-dropdown>
</template>

<script src="./ProfileBar.ts" />
