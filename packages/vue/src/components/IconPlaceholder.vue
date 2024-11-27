<script setup lang="ts">
import { computed, inject } from 'vue'

const props = defineProps<{
  type: string
}>()

const namedIcons: Record<string, any> = inject('namedIcons', {})

const targetIcon = computed(() => {
  return namedIcons[props.type]
})

const iconIsComponent = computed(() => {
  const value = targetIcon.value
  switch (typeof value) {
    case 'function': return true
    case 'object': return value != null && !Array.isArray(value)
  }
  return false
})
</script>

<template>
  <component v-if="iconIsComponent" :is="targetIcon"/>
  <span v-else-if="typeof targetIcon === 'string'" v-html="targetIcon"></span>
  <slot v-else/>
</template>
