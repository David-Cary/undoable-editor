<script setup lang="ts">
import { type ConversionFactory, type FlagOrObject, type SchemaOptionsParser } from 'schema-select'
import { type UndoableAction } from 'undoable-edits'
import { ReactiveUndoTrack } from '../composables/undo'
import UndoButton from './UndoButton.vue'
import RedoButton from './RedoButton.vue'
import ValueEditor from './ValueEditor.vue'

const model = defineModel()

withDefaults(
  defineProps<{
    schema?: FlagOrObject
    schemaParser?: SchemaOptionsParser<any, any>
    editorFactory?: ConversionFactory<any, FlagOrObject>
    disabled?: boolean
  }>(),
  {
    schema: true
  }
)

const valueChanges = new ReactiveUndoTrack()

function onUndoableChange(change: UndoableAction) {
  valueChanges.add(change)
}
</script>

<template>
  <span class="action-bar">
    <UndoButton :track="valueChanges" :disabled="disabled">
      <slot name="undo-icon" />
    </UndoButton>
    <RedoButton :track="valueChanges" :disabled="disabled">
      <slot name="redo-icon" />
    </RedoButton>
  </span>
  <ValueEditor
    v-model="model"
    @undoableChange="onUndoableChange"
    :schema="schema"
    :schemaParser="schemaParser"
    :editorFactory="editorFactory"
    :disabled="disabled"
  />
</template>
