import { type ConversionFactory, type FlagOrObject, getExpandedTypeOf } from 'schema-select'

export class TypeMappedValueFactory implements ConversionFactory<any, any, FlagOrObject> {
  typeValues: Record<string, any>

  constructor(typeValues: Record<string, any> = {}) {
    this.typeValues = typeValues
  }

  process(source: any, context?: FlagOrObject): any {
    const typeName = getExpandedTypeOf(source)
    const value = this.typeValues[typeName]
    if (
      value == null &&
      typeof context === 'object' &&
      typeof context?.type === 'string'
    ) {
      return this.typeValues[context.type]
    }
    return value
  }
}

export class LookupViaSchemaProperty implements ConversionFactory<any, any, FlagOrObject> {
  property: string
  values: Record<string, any>

  constructor(property: string, values: Record<string, any> = {}) {
    this.property = property
    this.values = values
  }

  process(source: any, schema?: FlagOrObject): any {
    if (typeof schema === 'object' && schema != null) {
      const key = schema[this.property]
      if (typeof key === 'string') {
        return this.values[key]
      }
    }
  }
}
