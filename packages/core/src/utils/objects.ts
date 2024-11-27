import { type FlagOrObject, type UntypedObject } from 'schema-select'

export interface PatternedSchema {
  schema: FlagOrObject
  expression?: RegExp
}

export function isObject(value: any): boolean {
  return typeof value === 'object' && value != null && !Array.isArray(value)
}

export function isFlagOrObject(value: any): boolean {
  switch (typeof value) {
    case 'boolean':
      return true
    case 'object':
      return value != null && !Array.isArray(value)
  }
  return false
}

export function getPropertySchemas(source: UntypedObject): Record<string, FlagOrObject> {
  const schemas: Record<string, FlagOrObject> = {}
  for (const key in source) {
    const value = source[key]
    if (isFlagOrObject(value)) {
      schemas[key] = value as FlagOrObject
    }
  }
  return schemas
}

export function getAdditionalPropertySchemas(source: UntypedObject): PatternedSchema[] {
  const schemas: PatternedSchema[] = []
  const patternProperties = source.patternProperties
  if (typeof patternProperties === 'object' && patternProperties != null) {
    for (const key in patternProperties) {
      const value = patternProperties[key]
      if (isFlagOrObject(value)) {
        const pattern = String(key)
        schemas.push({
          schema: value as FlagOrObject,
          expression: new RegExp(pattern)
        })
      }
    }
  }
  const additionalProperties = source.additionalProperties
  if (isFlagOrObject(additionalProperties)) {
    const entry: PatternedSchema = { schema: additionalProperties as FlagOrObject }
    const propertyNames = source.propertyNames
    if (
      typeof propertyNames === 'object' &&
      propertyNames != null &&
      'pattern' in propertyNames &&
      typeof propertyNames.pattern === 'string'
    ) {
      entry.expression = new RegExp(propertyNames.pattern)
    }
    schemas.push(entry)
  }
  return schemas
}

export function findPatternedSchemaFor(
  patterns: PatternedSchema[],
  name: string
): PatternedSchema | undefined {
  return patterns.find((pattern) => pattern.expression == null || pattern.expression.test(name))
}

export function getPropertyNameError(
  name: string,
  reservedNames?: string[],
  schema?: FlagOrObject
): string | undefined {
  if (name === '') {
    return 'noEmptyPropertyName'
  }
  if (reservedNames != null && reservedNames.includes(name)) {
    return 'noReservedPropertyName'
  }
  if (schema == null) {
    return 'noSchemaForProperty'
  }
}
