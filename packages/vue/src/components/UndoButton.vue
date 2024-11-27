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
    type="undo"
    :disabled="track.appliedActions.length <= 0 || disabled"
    @click="track.undo()"
  >&lt;</IconButton>
</template>
