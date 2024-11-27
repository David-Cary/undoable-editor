<script setup lang="ts">
import { computed, inject } from 'vue'
import { type FlagOrObject, type UntypedObject, StringEnforcer } from 'schema-select'
import { type GetKeyedText, echoKeyText } from '@undoable-editor/core'

const props = defineProps<{
  modelValue?: any
  schema?: FlagOrObject
  disabled?: boolean
}>()

const stringEnforcer = new StringEnforcer('')

const model = defineModel<string>({
  get() {
    return stringEnforcer.coerce(props.modelValue)
  }
})

const defaultSchema: UntypedObject = { type: 'string' }

const modelSchema = computed(() => {
  return typeof props.schema === 'object' && props.schema != null ? props.schema : defaultSchema
})

const getTranslatedText: GetKeyedText = inject('getTranslatedText', echoKeyText)

const inputType = computed(() => {
  return modelSchema.value.format
})

const description = computed(() => {
  return typeof modelSchema.value.description === 'string'
    ? getTranslatedText(modelSchema.value.description)
    : ''
})
</script>

<template>
  <input
    v-if="inputType != null"
    :type="inputType"
    v-model.lazy="model"
    class="string-editor"
    :disabled="disabled"
    :placeholder="description"
  />
  <textarea
    v-else
    v-model.lazy="model"
    class="string-editor"
    :disabled="disabled"
    :placeholder="description"
  />
</template>
