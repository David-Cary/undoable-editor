<script setup lang="ts">
import { computed, inject, ref, watch } from 'vue'
import { type ConversionFactory, type FlagOrObject, type SchemaOptionsParser } from 'schema-select'
import { type UndoableAction } from 'undoable-edits'
import {
  type GetKeyedText,
  echoKeyText,
  ValueTransferHandler
} from '@undoable-edits/core'
import IconButton from './IconButton.vue'
import ValueEditor from './ValueEditor.vue'

const props = defineProps<{
  owner?: any[]
  index?: number
  minItems?: number
  inTuple?: boolean
  schema?: FlagOrObject
  schemaParser?: SchemaOptionsParser
    editorFactory?: ConversionFactory<any, FlagOrObject>
  transferHandler?: ValueTransferHandler
  disabled?: boolean
}>()

const minItems = computed(() => {
  return props.minItems ?? 0
})

const emit = defineEmits<{
  (e: 'initItem', index: number, value: any): void
  (e: 'undoableChange', change: UndoableAction): void
  (e: 'setItemAt', index: number, value: any): void
  (e: 'removeItemAt', index: number): void
}>()

const getTranslatedText: GetKeyedText = inject('getTranslatedText', echoKeyText)

const targetValue = ref()

watch(
  props,
  () => {
    if (props.owner != null && props.index != null) {
      const value = props.owner[props.index]
      if (targetValue.value !== value) {
        targetValue.value = value
      }
    }
  },
  { immediate: true }
)

const ownerSize = computed(() => {
  return props.owner?.length ?? 0
})

const isLastItem = computed(() => {
  return props.index != null ? props.index === ownerSize.value - 1 : false
})

const schemaObject = computed(() => {
  return typeof props.schema === 'object' && props.schema != null ? props.schema : {}
})

function onUndoableChange(event: UndoableAction) {
  if (props.owner != null && props.index != null) {
    if (props.owner[props.index] !== targetValue.value) {
      emit('setItemAt', props.index, targetValue.value)
    } else {
      emit('undoableChange', event)
    }
  }
}

function onValueInitialized(value: any) {
  if (props.owner != null && props.index != null) {
    emit('initItem', props.index, value)
  }
}

function onDragStart(event: DragEvent) {
  if (event.dataTransfer != null) {
    event.dataTransfer.setData('application/json', targetValue.value)
    event.dataTransfer.effectAllowed = 'move'
  }
  if (props.transferHandler != null && props.owner != null && props.index != null) {
    props.transferHandler.startTransfer({
      source: props.owner,
      index: props.index
    })
  }
}
</script>

<template>
  <div class="item-editor flex-row" draggable="true" @dragstart="onDragStart">
    <div>
      <IconButton
        v-if="(!inTuple || isLastItem) && index != null && ownerSize > minItems"
        type="delete"
        :disabled="disabled"
        @click="emit('removeItemAt', index)"
      >-</IconButton>
    </div>
    <span v-if="inTuple && schemaObject.title != null">
      {{ getTranslatedText(schemaObject.title) }}:&nbsp;
    </span>
    <ValueEditor
      v-if="owner != null && index != null"
      v-model="targetValue"
      :schema="schema"
      :schemaParser="schemaParser"
      :editorFactory="editorFactory"
      :transferHandler="transferHandler"
      :disabled="disabled"
      @valueInitialized="onValueInitialized"
      @undoableChange="onUndoableChange"
    >
      <template v-slot:add-icon>
        <slot name="add-icon" />
      </template>
      <template v-slot:delete-icon>
        <slot name="delete-icon" />
      </template>
      <template v-slot:revert-icon>
        <slot name="revert-icon" />
      </template>
      <template v-slot:copy-icon>
        <slot name="copy-icon" />
      </template>
      <template v-slot:cut-icon>
        <slot name="cut-icon" />
      </template>
      <template v-slot:paste-icon>
        <slot name="paste-icon" />
      </template>
    </ValueEditor>
  </div>
</template>

<style>
.flex-row {
  display: flex;
}
</style>
