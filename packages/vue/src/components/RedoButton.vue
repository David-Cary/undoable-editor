<script setup lang="ts">
import { ReactiveUndoTrack } from '../composables/undo'
import IconButton from './IconButton.vue'

defineProps<{
  track: ReactiveUndoTrack
  disabled?: boolean
}>()
</script>

<template>
  <IconButton
    type="redo"
    :disabled="track.undoneActions.length <= 0 || disabled"
    @click="track.redo()"
  >&gt;</IconButton>
</template>
