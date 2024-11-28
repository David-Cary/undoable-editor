<script setup lang="ts">
import { type UndoableAction } from 'undoable-edits'
import { ValueTransferHandler } from '@undoable-edits/core'
import IconButton from './IconButton.vue'

const props = defineProps<{
  owner?: any[]
  index: number
  transferHandler?: ValueTransferHandler
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'undoableChange', change: UndoableAction): void
  (e: 'addItemAt', index: number, value?: any): void
  (e: 'pasteItemAt', index: number, items: any[]): void
}>()

async function pasteItems() {
  try {
    const text = await navigator.clipboard.readText()
    try {
      const parsed = JSON.parse(text)
      if (Array.isArray(parsed)) {
        emit('pasteItemAt', props.index, parsed)
      } else {
        emit('pasteItemAt', props.index, [parsed])
      }
    } catch (error: any) {
      emit('pasteItemAt', props.index, [text])
    }
  } catch (error: any) {
    alert(error.message)
  }
}

function onDragOver(event: DragEvent) {
  event.preventDefault()
}

function onDrop(event: DragEvent) {
  if (event.dataTransfer != null) {
    if (props.transferHandler != null && props.owner != null && props.index != null) {
      const action = props.transferHandler.completeTransfer({
        source: props.owner,
        index: props.index
      })
      if (action != null) {
        emit('undoableChange', action)
      }
    } else {
      const data = event.dataTransfer.getData('application/json')
      try {
        const parsed = JSON.parse(data)
        event.preventDefault()
        event.dataTransfer.dropEffect = 'move'
        emit('addItemAt', props.index, parsed)
      } catch (error: any) {
        alert(error?.message)
      }
    }
  }
}
</script>

<template>
  <span class="array-insert">
    <IconButton
      type="add"
      :disabled="disabled"
      @click="emit('addItemAt', index)"
      @dragover="onDragOver"
      @drop="onDrop"
    >+</IconButton>
    <IconButton
      type="paste"
      :disabled="disabled"
      @click="pasteItems"
    >p</IconButton>
  </span>
</template>
