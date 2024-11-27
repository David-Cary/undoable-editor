<script setup lang="ts">
import { inject } from 'vue'
import IconButton from './IconButton.vue'

defineProps<{
  message: string
}>()

const showAlert: ((message: string) => void) = inject(
  'showAlert',
  (message) => window.alert(message)
)
</script>

<template>
  <IconButton type="alert" @click="showAlert(message)">!</IconButton>
</template>
