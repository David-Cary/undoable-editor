<script setup lang="ts">
import { computed, inject, ref, watch } from 'vue'
import {
  type ConversionFactory,
  type FlagOrObject,
  type SchemaOptionsParser,
  type UntypedObject
} from 'schema-select'
import { type UndoableAction } from 'undoable-edits'
import {
  type GetKeyedText,
  echoKeyText,
  ValueTransferHandler,
  type PatternedSchema,
  findPatternedSchemaFor,
  getPropertyNameError
} from '@undoable-editor/core'
import ValueEditor from './ValueEditor.vue'
import AlertButton from './AlertButton.vue'
import IconButton from './IconButton.vue'

const props = defineProps<{
  owner?: UntypedObject
  propertyName?: string
  reservedNames?: string[]
  namedProperties?: Record<string, FlagOrObject>
  requiredProperties?: string[]
  additionalPropertySchemas?: PatternedSchema[]
  schemaParser?: SchemaOptionsParser
    editorFactory?: ConversionFactory<any, FlagOrObject>
  transferHandler?: ValueTransferHandler
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'undoableChange', change: UndoableAction): void
  (e: 'addProperty', key: string, value: any): void
  (e: 'addProperties', values: UntypedObject | any[]): void
  (e: 'removeProperty', key: string): void
  (e: 'setProperty', key: string, value: any): void
  (e: 'initProperty', key: string, value: any): void
  (e: 'renameProperty', from: string, to: string, value: any): void
}>()

const pendingName = ref('')
const pendingValue = ref()

watch(
  props,
  () => {
    if (pendingName.value !== props.propertyName) {
      pendingName.value = props.propertyName ?? ''
    }
    if (props.owner != null && props.propertyName != null) {
      const value = props.owner[props.propertyName]
      if (pendingValue.value !== value) {
        pendingValue.value = value
      }
    }
  },
  { immediate: true }
)

function onNameChange(event: Event) {
  if ('target' in event) {
    pendingName.value = ((event as InputEvent).target as HTMLInputElement).value
  }
}

const getTranslatedText: GetKeyedText = inject('getTranslatedText', echoKeyText)

const namedPropertySchema = computed(() => {
  if (props.propertyName != null && props.namedProperties) {
    return props.namedProperties[props.propertyName]
  }
  return undefined
})

const isExplicitProperty = computed(() => {
  return namedPropertySchema.value != null
})

const activeSchema = computed(() => {
  if (namedPropertySchema.value != null) {
    return namedPropertySchema.value
  }
  if (props.additionalPropertySchemas != null) {
    const pattern = findPatternedSchemaFor(props.additionalPropertySchemas, pendingName.value)
    if (pattern != null) return pattern.schema
  }
  return undefined
})

const isRequired = computed(() => {
  const schema = activeSchema.value
  if (typeof schema === 'object' && schema?.required === true) {
    return true
  }
  if (props.propertyName != null && props.requiredProperties != null) {
    return props.requiredProperties.includes(props.propertyName)
  }
  return false
})

const pendingNameError = computed(() => {
  if (pendingName.value !== props.propertyName) {
    const error = getPropertyNameError(pendingName.value, props.reservedNames, activeSchema.value)
    if (error != null) return getTranslatedText(error)
  }
  return undefined
})

function addProperty() {
  let value =
    pendingValue.value === undefined && initializer.value?.coerce != null
      ? initializer.value.coerce(undefined)
      : pendingValue.value
  emit('addProperty', pendingName.value, value)
}

function removeProperty() {
  if (props.propertyName != null) {
    emit('removeProperty', props.propertyName)
  }
}

function revertName() {
  pendingName.value = props.propertyName ?? ''
}

function renameProperty() {
  if (props.propertyName != null) {
    emit('renameProperty', props.propertyName, pendingName.value, pendingValue.value)
  }
}

function onUndoableChange(event: UndoableAction) {
  if (props.owner != null && props.propertyName != null) {
    if (props.owner[props.propertyName] !== pendingValue.value) {
      emit('setProperty', props.propertyName, pendingValue.value)
    } else {
      emit('undoableChange', event)
    }
    pendingName.value = props.propertyName
  }
}

function onValueInitialized(value: any) {
  if (props.owner != null && props.propertyName != null) {
    emit('initProperty', props.propertyName, value)
  }
}

const schemaOptions = computed(() => {
  if (props.schemaParser != null && activeSchema.value != null) {
    return props.schemaParser.getOptionsFor(activeSchema.value)
  }
  return undefined
})

const initializer = computed(() => {
  if (props.schemaParser != null && schemaOptions.value != null) {
    const match = props.schemaParser.getMostValidOption(schemaOptions.value, undefined)
    return match?.value
  }
  return undefined
})

function initializeProperty() {
  if (initializer.value?.coerce != null && props.owner != null && props.propertyName != null) {
    const value = initializer.value.coerce(undefined)
    emit('setProperty', props.propertyName, value)
  }
}

async function copyProperty() {
  try {
    const text = JSON.stringify({
      [pendingName.value]: pendingValue.value
    })
    await navigator.clipboard.writeText(text)
  } catch (error: any) {
    alert(error.message)
  }
}

async function cutProperty() {
  await copyProperty()
  removeProperty()
}

async function cutValue() {
  try {
    const text = JSON.stringify(pendingValue.value)
    await navigator.clipboard.writeText(text)
  } catch (error: any) {
    alert(error.message)
  }
  removeProperty()
}

async function pasteProperties() {
  try {
    const text = await navigator.clipboard.readText()
    try {
      const parsed = JSON.parse(text)
      if (typeof parsed === 'object' && parsed != null) {
        emit('addProperties', parsed)
      } else {
        pendingName.value = String(parsed)
      }
    } catch (error: any) {
      pendingName.value = text
    }
  } catch (error: any) {
    alert(error.message)
  }
}
</script>

<template>
  <div class="property-editor flex-row">
    <div>
      <template v-if="propertyName == null">
        <IconButton
          type="add"
          :disabled="disabled || pendingNameError != null"
          @click="addProperty"
        >+</IconButton>
        <IconButton
          type="paste"
          :disabled="disabled || pendingNameError != null"
          @click="pasteProperties"
        >p</IconButton>
      </template>
      <template v-else-if="!isExplicitProperty">
        <IconButton
          type="delete"
          :disabled="disabled"
          @click="removeProperty"
        >-</IconButton>
        <IconButton
          type="cut"
          :disabled="disabled"
          @click="cutProperty"
        >x</IconButton>
        <IconButton
          type="copy"
          :disabled="disabled"
          @click="copyProperty"
        >c</IconButton>
        <template v-if="pendingName !== propertyName">
          <IconButton
            type="rename"
            :disabled="disabled || pendingNameError != null"
            @click="renameProperty"
          >~</IconButton>
          <IconButton
            type="revert"
            :disabled="disabled"
            @click="revertName"
          >&lt;</IconButton>
        </template>
      </template>
      <AlertButton
        v-if="pendingNameError != null"
        :message="getTranslatedText(pendingNameError)"
      />
    </div>
    <div>
      <span v-if="isExplicitProperty">{{ propertyName }}</span>
      <input
        v-else
        type="text"
        :class="{ invalid: pendingNameError != null }"
        :value="pendingName"
        @input="onNameChange($event)"
        :disabled="disabled"
      />
      <span v-if="propertyName != null">:&nbsp;</span>
    </div>
    <div v-if="activeSchema && propertyName != null">
      <ValueEditor
        v-if="isRequired || pendingValue !== undefined || schemaParser == null"
        v-model="pendingValue"
        :schema="activeSchema"
        :schemaParser="schemaParser"
        :editorFactory="editorFactory"
        :transferHandler="transferHandler"
        :disabled="disabled"
        :options="schemaOptions"
        @valueInitialized="onValueInitialized"
        @undoableChange="onUndoableChange"
      />
      <IconButton
        type="add"
        :disabled="disabled"
        @click="initializeProperty"
      >+</IconButton>
    </div>
    <div v-if="isExplicitProperty && pendingValue !== undefined && !isRequired">
      <IconButton
        type="delete"
        :disabled="disabled"
        @click="removeProperty"
      >-</IconButton>
      <IconButton
        type="cut"
        :disabled="disabled"
        @click="cutValue"
      >x</IconButton>
    </div>
  </div>
</template>

<style>
.flex-row {
  display: flex;
}
</style>
