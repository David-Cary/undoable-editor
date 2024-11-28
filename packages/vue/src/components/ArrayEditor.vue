<script setup lang="ts">
import { computed, inject } from 'vue'
import { type UndoableAction, UndoableSetItemAt, UndoableSplice } from 'undoable-edits'
import {
  type ConversionFactory,
  type FlagOrObject,
  type UntypedObject,
  type SchemaOptionsParser,
  ArrayEnforcer
} from 'schema-select'
import {
  type GetKeyedText,
  echoKeyText,
  isFlagOrObject,
  ValueTransferHandler
} from '@undoable-edits/core'
import IconButton from './IconButton.vue'
import ArrayItemEditor from './ArrayItemEditor.vue'
import ArrayInsertionButtons from './ArrayInsertionButtons.vue'

const props = defineProps<{
  modelValue: any
  schema?: FlagOrObject
  schemaParser?: SchemaOptionsParser
    editorFactory?: ConversionFactory<any, FlagOrObject>
  transferHandler?: ValueTransferHandler
  disabled?: boolean
}>()

const arrayEnforcer = new ArrayEnforcer()

const model = defineModel<any[]>({
  get() {
    return arrayEnforcer.coerce(props.modelValue)
  }
})

const emit = defineEmits<{
  (e: 'undoableChange', change: UndoableAction): void
}>()

const getTranslatedText: GetKeyedText = inject('getTranslatedText', echoKeyText)

const transferHandler = computed(() => {
  return props.transferHandler ?? new ValueTransferHandler()
})

const defaultSchema: UntypedObject = {
  type: 'array',
  items: true
}

const modelSchema = computed(() => {
  return typeof props.schema === 'object' && props.schema != null ? props.schema : defaultSchema
})

const numItems = computed(() => {
  return model.value?.length ?? 0
})

const maxItems = computed(() => {
  if (typeof props.schema === 'object' && props.schema != null) {
    const num = Number(props.schema.maxItems)
    if (!isNaN(num)) return num
  }
  return Number.POSITIVE_INFINITY
})

const minItems = computed(() => {
  if (typeof props.schema === 'object' && props.schema != null) {
    const num = Number(props.schema.minItems)
    if (!isNaN(num)) return num
  }
  return 0
})

const tupleSchemas = computed(() => {
  if (Array.isArray(modelSchema.value.prefixItems)) {
    return modelSchema.value.prefixItems
  }
  if (Array.isArray(modelSchema.value.items)) {
    return modelSchema.value.items
  }
  return []
})

const additionalItemsSchema = computed(() => {
  if (isFlagOrObject(modelSchema.value.additionalItems)) {
    return modelSchema.value.additionalItems as FlagOrObject
  }
  if (isFlagOrObject(modelSchema.value.items)) {
    return modelSchema.value.items as FlagOrObject
  }
  return true
})

function onInitItem(index: number, value: any) {
  if (model.value != null) model.value[index] = value
}

function addItemAt(index: number, value?: any) {
  if (model.value != null) {
    const change = new UndoableSplice(model.value, index, 0, value)
    change.redo()
    emit('undoableChange', change)
  }
}

function addItemsAt(index: number, items: any[]) {
  if (model.value != null) {
    const change = new UndoableSplice(model.value, index, 0, ...items)
    change.redo()
    emit('undoableChange', change)
  }
}

function setItemAt(index: number, value: any) {
  if (model.value != null) {
    const change = new UndoableSetItemAt(model.value, index, value)
    change.redo()
    emit('undoableChange', change)
  }
}

function removeItemAt(index: number) {
  if (model.value != null) {
    const change = new UndoableSplice(model.value, index, 1)
    change.redo()
    emit('undoableChange', change)
  }
}

async function copyToClipboard() {
  if (model.value != null) {
    try {
      const text = JSON.stringify(model.value)
      await navigator.clipboard.writeText(text)
    } catch (error: any) {
      alert(error.message)
    }
  }
}

async function pasteFromClipboard() {
  try {
    const text = await navigator.clipboard.readText()
    const parsed = JSON.parse(text)
    if (typeof parsed === 'object' && parsed != null) {
      model.value = arrayEnforcer.coerce(parsed)
    } else {
      alert(getTranslatedText('pastedValueIsNonObject', { value: parsed }))
    }
  } catch (error: any) {
    alert(error.message)
  }
}
</script>

<template>
  <span class="array-editor">
    <span class="copy-paste-bar">
      <IconButton
        type="copy"
        :disabled="disabled"
        @click="copyToClipboard"
      >c</IconButton>
      <IconButton
        type="paste"
        :disabled="disabled"
        @click="pasteFromClipboard"
      >p</IconButton>
    </span>
    <template v-for="(item, index) in model" :key="index">
      <div v-if="index >= tupleSchemas.length && numItems < maxItems">
        <ArrayInsertionButtons
          :owner="model"
          :index="index"
          :transferHandler="transferHandler"
          @addItemAt="addItemAt"
          @pasteItemAt="addItemsAt"
          @undoableChange="emit('undoableChange', $event)"
        >
          <template v-slot:add-icon>
            <slot name="add-icon" />
          </template>
          <template v-slot:paste-icon>
            <slot name="paste-icon" />
          </template>
        </ArrayInsertionButtons>
      </div>
      <ArrayItemEditor
        :owner="model"
        :index="index"
        :transferHandler="transferHandler"
        :minItems="minItems"
        :inTuple="index < tupleSchemas.length"
        :schema="tupleSchemas[index] ?? additionalItemsSchema"
        :schemaParser="schemaParser"
        :editorFactory="editorFactory"
        :disabled="disabled"
        @setItemAt="setItemAt"
        @removeItemAt="removeItemAt"
        @undoableChange="emit('undoableChange', $event)"
        @initItem="onInitItem"
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
        <template v-slot:alert-button>
          <slot name="alert-button" />
        </template>
      </ArrayItemEditor>
    </template>
    <div v-if="numItems < maxItems">
      <ArrayInsertionButtons
        :owner="model"
        :index="numItems"
        :transferHandler="transferHandler"
        @addItemAt="addItemAt"
        @pasteItemAt="addItemsAt"
        @undoableChange="emit('undoableChange', $event)"
      >
        <template v-slot:add-icon>
          <slot name="add-icon" />
        </template>
        <template v-slot:paste-icon>
          <slot name="paste-icon" />
        </template>
      </ArrayInsertionButtons>
    </div>
  </span>
</template>
