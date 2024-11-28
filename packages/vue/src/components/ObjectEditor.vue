<script setup lang="ts">
import { computed, inject } from 'vue'
import {
  type UndoableAction,
  UndoableSetProperty,
  UndoableRenameProperty,
  UndoableDeleteProperty,
  UndoableActionSequence
} from 'undoable-edits'
import {
  type ConversionFactory,
  type FlagOrObject,
  type SchemaOptionsParser,
  ObjectEnforcer,
  type UntypedObject
} from 'schema-select'
import { 
  type GetKeyedText,
  echoKeyText,
  isFlagOrObject,
  isObject,
  findPatternedSchemaFor,
  getPropertySchemas,
  getAdditionalPropertySchemas,
  ValueTransferHandler
} from '@undoable-edits/core'
import IconButton from './IconButton.vue'
import PropertyEditor from './PropertyEditor.vue'

const props = defineProps<{
  modelValue: any
  schema?: FlagOrObject
  schemaParser?: SchemaOptionsParser
    editorFactory?: ConversionFactory<any, FlagOrObject>
  transferHandler?: ValueTransferHandler
  disabled?: boolean
}>()

const objectEnforcer = new ObjectEnforcer()

const model = defineModel<UntypedObject>({
  get() {
    return objectEnforcer.coerce(props.modelValue)
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
  type: 'object',
  additionalProperties: true
}

const modelSchema = computed(() => {
  return typeof props.schema === 'object' && props.schema != null ? props.schema : defaultSchema
})

const schemaProperties = computed(() => {
  if (isObject(modelSchema.value.properties)) {
    return getPropertySchemas(modelSchema.value.properties)
  }
  return {}
})

const propertyNames = computed(() => {
  const mergedProps = { ...schemaProperties.value, ...model.value }
  const keys = Object.keys(mergedProps)
  return keys
})

const additionalPropertySchemas = computed(() => {
  return getAdditionalPropertySchemas(modelSchema.value)
})

const requiredProperties = computed(() => {
  const required = modelSchema.value.required
  if (Array.isArray(required)) {
    return required.filter((item) => typeof item === 'string')
  }
  return []
})

function onInitProperty(key: string, value: any) {
  if (model.value != null) model.value[key] = value
}

function onSetProperty(key: string, value: any) {
  if (model.value != null) {
    const change = new UndoableSetProperty(model.value, key, value)
    model.value[key] = value
    emit('undoableChange', change)
  }
}

function onSetProperties(values: UntypedObject | any[]) {
  if (model.value != null) {
    const changes: UndoableAction[] = []
    for (const key in values) {
      const propertyName = String(key)
      if (propertyName != '') {
        const schema = getNamedPropertySchema(propertyName)
        if (schema != null) {
          const change = Array.isArray(values)
            ? new UndoableSetProperty(model.value, key, values[Number(key)])
            : new UndoableSetProperty(model.value, propertyName, values[propertyName])
          changes.push(change)
        }
      }
    }
    if (changes.length > 0) {
      const action = new UndoableActionSequence(changes)
      action.redo()
      emit('undoableChange', action)
    }
  }
}

function getNamedPropertySchema(name: string) {
  if (name in schemaProperties.value) {
    const value = schemaProperties.value[name]
    if (isFlagOrObject(value)) {
      return value
    }
  }
  if (additionalPropertySchemas.value != null) {
    const pattern = findPatternedSchemaFor(additionalPropertySchemas.value, name)
    if (pattern != null) return pattern.schema
  }
}

function onRemoveProperty(key: string) {
  if (model.value != null) {
    const change = new UndoableDeleteProperty(model.value, key)
    change.redo()
    emit('undoableChange', change)
  }
}

function onRenameProperty(from: string, to: string, value: any) {
  if (model.value != null) {
    const renameAction = new UndoableRenameProperty(model.value, from, to)
    const change =
      renameAction.value !== value
        ? new UndoableActionSequence([
            renameAction,
            new UndoableSetProperty(model.value, to, value)
          ])
        : renameAction
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
      model.value = objectEnforcer.coerce(parsed)
    } else {
      alert(getTranslatedText('pastedValueIsNonObject', { value: parsed }))
    }
  } catch (error: any) {
    alert(error.message)
  }
}
</script>

<template>
  <span class="object-editor">
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
    <PropertyEditor
      v-for="(name, index) in propertyNames"
      :key="index"
      :owner="model"
      :propertyName="name"
      :reservedNames="propertyNames"
      :namedProperties="schemaProperties"
      :requiredProperties="requiredProperties"
      :additionalPropertySchemas="additionalPropertySchemas"
      :schemaParser="schemaParser"
      :editorFactory="editorFactory"
      :transferHandler="transferHandler"
      @initProperty="onInitProperty"
      @removeProperty="onRemoveProperty"
      @renameProperty="onRenameProperty"
      @setProperty="onSetProperty"
      @undoableChange="emit('undoableChange', $event)"
    />
    <PropertyEditor
      v-if="additionalPropertySchemas.length > 0"
      :reservedNames="propertyNames"
      :namedProperties="schemaProperties"
      :requiredProperties="requiredProperties"
      :additionalPropertySchemas="additionalPropertySchemas"
      :schemaParser="schemaParser"
      :editorFactory="editorFactory"
      @addProperty="onSetProperty"
      @addProperties="onSetProperties"
    />
  </span>
</template>
