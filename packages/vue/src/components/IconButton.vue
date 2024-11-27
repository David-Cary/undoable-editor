<script setup lang="ts">
import { computed } from 'vue'
import IconPlaceholder from './IconPlaceholder.vue'

const props = defineProps<{
  type: string
}>()

const typeClass = computed(() => {
  return `${props.type}-button`
})
</script>

<template>
  <button type="button" :class="typeClass">
    <IconPlaceholder :type="type">
      <slot/>
    </IconPlaceholder>
  </button>
</template>
