<script setup lang="ts">
import { ref, provide } from 'vue'
import { type UntypedObject } from 'schema-select'
import {
  KeyedTextTranslator,
  PLACEHOLDER_TEXT,
  LookupViaSchemaProperty
} from '@undoable-editor/core'
import UndoableValueEditor from './components/UndoableValueEditor.vue'
import BooleanEditor from './components/BooleanEditor.vue'

const translator = new KeyedTextTranslator(PLACEHOLDER_TEXT)
provide('getTranslatedText', (key: string | string[]) => translator.translate(key))

provide('namedIcons', {
  add: `<u>+</u>`,
  delete: `<u>-</u>`,
  rename: "Rename",
  revert: "Revert",
  copy: "Copy",
  cut: "Cut",
  paste: "Paste",
  alert: `<u>!</u>`,
  undo: "Undo",
  redo: "Redo"
})

const schema: UntypedObject = {
  oneOf: [
    { type: 'null' },
    { type: 'boolean' },
    { type: 'number' },
    { const: 'STATIC' },
    { type: 'string' },
    { type: 'string', format: 'text' },
    { type: 'string', format: 'date' },
    { type: 'string', format: 'flag' },
    { type: 'object', additionalProperties: true },
    {
      title: 'named object',
      type: 'object',
      properties: {
        name: {
          type: 'string',
          format: 'text',
          required: true
        },
        alias: {
          type: 'string',
          format: 'text',
          description: 'alternative to name'
        }
      },
      additionalProperties: true
    },
    {
      title: 'patterned object',
      type: 'object',
      patternProperties: {
        '^is[_A-Z]': { type: 'boolean' },
        Text$: { type: 'string' },
        Count$: { type: 'string' },
        Map$: { type: 'object', additionalProperties: true },
        List$: { type: 'object', additionalProperties: true }
      },
      additionalProperties: true,
      propertyNames: {
        pattern: '^[A-Za-z_][A-Za-z0-9_]*$'
      }
    },
    {
      title: 'text map',
      type: 'object',
      additionalProperties: { type: 'string', format: 'text' }
    },
    { type: 'array', items: true },
    {
      title: 'num list',
      type: 'array',
      items: { type: 'number' }
    },
    {
      title: 'fixed params',
      type: 'array',
      items: [
        {
          title: 'text',
          type: 'string',
          format: 'text',
          description: 'target text'
        },
        { type: 'number' }
      ]
    },
    {
      title: 'sized list',
      type: 'array',
      items: true,
      minItems: 2,
      maxItems: 4
    }
  ]
}

const val = ref()
const disabled = ref(false)

const editorFactory = new LookupViaSchemaProperty('format', { flag: BooleanEditor })
</script>

<template>
  <UndoableValueEditor
    v-model="val"
    :schema="schema"
    :editorFactory="editorFactory"
    :disabled="disabled"
  />
  <div>{{ val }} is {{ typeof val }}</div>
  <div>
    <input type="checkbox" v-model="disabled" />
    <label>Disabled</label>
  </div>
</template>
