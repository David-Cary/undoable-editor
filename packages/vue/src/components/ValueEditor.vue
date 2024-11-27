<script setup lang="ts">
import { computed, shallowRef, watch, watchEffect } from 'vue'
import {
  type ConversionFactory,
  type FlagOrObject,
  type LabeledValue,
  type SchemaEnforcer,
  SchemaOptionsParser,
  JSONSchemaOptionsParser
} from 'schema-select'
import { type UndoableAction, UndoableSetProperty } from 'undoable-edits'
import { TypeMappedValueFactory, ValueTransferHandler } from '@undoable-editor/core'
import ArrayEditor from './ArrayEditor.vue'
import BooleanEditor from './BooleanEditor.vue'
import NumberEditor from './NumberEditor.vue'
import ObjectEditor from './ObjectEditor.vue'
import StringEditor from './StringEditor.vue'

const model = defineModel()

const props = withDefaults(
  defineProps<{
    schema?: FlagOrObject
    schemaParser?: SchemaOptionsParser<any, any>
    editorFactory?: ConversionFactory<any, FlagOrObject>
    transferHandler?: ValueTransferHandler
    disabled?: boolean
    options?: Array<LabeledValue<SchemaEnforcer<any, any>>>
  }>(),
  {
    schema: true
  }
)

const emit = defineEmits<{
  (e: 'undoableChange', change: UndoableAction): void
  (e: 'valueInitialized', value: any): void
}>()

const schemaParser = computed(() => {
  return props.schemaParser ?? new JSONSchemaOptionsParser()
})

const schemaOptions = computed(() => {
  if (props.options != null) return props.options
  const schema = props.schema ?? true
  const options = schemaParser.value.getOptionsFor(schema)
  return options
})

const activeOption = shallowRef<LabeledValue<SchemaEnforcer<any, any>>>()
const selectedOption = shallowRef<LabeledValue<SchemaEnforcer<any, any>>>()

watchEffect(() => {
  if (activeOption.value != null && schemaOptions.value.includes(activeOption.value)) {
    const validation = activeOption.value.value.validate(model.value)
    if (schemaParser.value.validationParser.isValid(validation)) {
      return
    }
    const match = schemaParser.value.getMostValidOption(schemaOptions.value, model.value)
    if (activeOption.value != match) {
      activeOption.value = match
      selectedOption.value = match
    }
  } else {
    const match = schemaParser.value.getMostValidOption(schemaOptions.value, model.value)
    if (match != null) {
      activeOption.value = match
      selectedOption.value = match
    }
  }
  if (activeOption.value?.value.coerce != null) {
    const coerced = activeOption.value.value.coerce(model.value)
    if (model.value !== coerced) {
      model.value = coerced
      emit('valueInitialized', coerced)
    }
  }
})

watch(selectedOption, () => {
  const option = selectedOption.value
  if (activeOption.value !== option) {
    activeOption.value = option
    if (option?.value.coerce != null) {
      const coerced = option.value.coerce(model.value)
      emitModelChange(coerced)
    }
  }
})

const defaultEditorResolver = new TypeMappedValueFactory({
  array: ArrayEditor,
  bigint: NumberEditor,
  boolean: BooleanEditor,
  integer: NumberEditor,
  number: NumberEditor,
  object: ObjectEditor,
  string: StringEditor
})

const activeEditor = computed(() => {
  if (props.editorFactory != null) {
    const component = props.editorFactory.process(model.value, activeOption.value?.value.schema)
    if (component != null) return component
  }
  if (activeOption.value?.value.schema['const'] != null) return
  return defaultEditorResolver.process(model.value, activeOption.value?.value.schema)
})

function emitModelChange(newValue: any) {
  if (model.value !== newValue) {
    const change = new UndoableSetProperty(model, 'value', newValue)
    model.value = newValue
    emit('undoableChange', change)
  }
}
</script>

<template>
  <span class="value-editor">
    <select
      v-if="schemaOptions.length > 1"
      class="schema-dropdown"
      v-model="selectedOption"
      :disabled="disabled"
    >
      <option v-for="(option, index) in schemaOptions" :value="option" :key="index">
        {{ option.label }}
      </option>
    </select>
    <component
      v-if="activeEditor && activeOption"
      :is="activeEditor"
      :modelValue="model"
      @update:modelValue="emitModelChange"
      @undoableChange="emit('undoableChange', $event)"
      :schema="activeOption.value.schema"
      :schemaParser="schemaParser"
      :editorFactory="editorFactory"
      :transferHandler="transferHandler"
      :disabled="disabled"
    />
    <slot v-else-if="schemaOptions.length <= 1" name="no-editor">{{ model }}</slot>
  </span>
</template>
