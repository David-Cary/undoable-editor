import { getExpandedTypeOf } from 'schema-select';
export class TypeMappedValueFactory {
    typeValues;
    constructor(typeValues = {}) {
        this.typeValues = typeValues;
    }
    process(source, context) {
        const typeName = getExpandedTypeOf(source);
        const value = this.typeValues[typeName];
        if (value == null &&
            typeof context === 'object' &&
            typeof context?.type === 'string') {
            return this.typeValues[context.type];
        }
        return value;
    }
}
export class LookupViaSchemaProperty {
    property;
    values;
    constructor(property, values = {}) {
        this.property = property;
        this.values = values;
    }
    process(source, schema) {
        if (typeof schema === 'object' && schema != null) {
            const key = schema[this.property];
            if (typeof key === 'string') {
                return this.values[key];
            }
        }
    }
}
