<script setup lang="ts">
import { computed } from 'vue'
import { type FlagOrObject } from 'schema-select'

const model = defineModel()

const props = defineProps<{
  disabled?: boolean
  schema?: FlagOrObject
}>()

const schema = computed(() => {
  return typeof props.schema === 'object' && props.schema != null
    ? props.schema
    : {}
})
</script>

<template>
  <span class="number-editor">
    <input
      type="number"
      v-model.lazy="model"
      :disabled="disabled"
      :min="schema.minimum"
      :max="schema.maximum"
      :placeholder="schema.title"
      :step="schema.multipleOf"
    />
    <input
      type="range"
      v-if="schema.minimum != null && schema.maximum != null"
      v-model.lazy="model"
      :disabled="disabled"
      :min="schema.minimum"
      :max="schema.maximum"
      :step="schema.multipleOf"
    />
  </span>
</template>
