export function isObject(value) {
    return typeof value === 'object' && value != null && !Array.isArray(value);
}
export function isFlagOrObject(value) {
    switch (typeof value) {
        case 'boolean':
            return true;
        case 'object':
            return value != null && !Array.isArray(value);
    }
    return false;
}
export function getPropertySchemas(source) {
    const schemas = {};
    for (const key in source) {
        const value = source[key];
        if (isFlagOrObject(value)) {
            schemas[key] = value;
        }
    }
    return schemas;
}
export function getAdditionalPropertySchemas(source) {
    const schemas = [];
    const patternProperties = source.patternProperties;
    if (typeof patternProperties === 'object' && patternProperties != null) {
        for (const key in patternProperties) {
            const value = patternProperties[key];
            if (isFlagOrObject(value)) {
                const pattern = String(key);
                schemas.push({
                    schema: value,
                    expression: new RegExp(pattern)
                });
            }
        }
    }
    const additionalProperties = source.additionalProperties;
    if (isFlagOrObject(additionalProperties)) {
        const entry = { schema: additionalProperties };
        const propertyNames = source.propertyNames;
        if (typeof propertyNames === 'object' &&
            propertyNames != null &&
            'pattern' in propertyNames &&
            typeof propertyNames.pattern === 'string') {
            entry.expression = new RegExp(propertyNames.pattern);
        }
        schemas.push(entry);
    }
    return schemas;
}
export function findPatternedSchemaFor(patterns, name) {
    return patterns.find((pattern) => pattern.expression == null || pattern.expression.test(name));
}
export function getPropertyNameError(name, reservedNames, schema) {
    if (name === '') {
        return 'noEmptyPropertyName';
    }
    if (reservedNames != null && reservedNames.includes(name)) {
        return 'noReservedPropertyName';
    }
    if (schema == null) {
        return 'noSchemaForProperty';
    }
}
