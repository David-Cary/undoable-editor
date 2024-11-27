<script setup lang="ts">
import { type FlagOrObject } from 'schema-select'

const model = defineModel()

defineProps<{
  schema?: FlagOrObject
  disabled?: boolean
}>()
</script>

<template>
  <input type="checkbox" v-model="model" class="boolean-editor" :disabled="disabled" />
</template>
