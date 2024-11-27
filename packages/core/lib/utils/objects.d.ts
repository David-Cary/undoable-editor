import { type FlagOrObject, type UntypedObject } from 'schema-select';
export interface PatternedSchema {
    schema: FlagOrObject;
    expression?: RegExp;
}
export declare function isObject(value: any): boolean;
export declare function isFlagOrObject(value: any): boolean;
export declare function getPropertySchemas(source: UntypedObject): Record<string, FlagOrObject>;
export declare function getAdditionalPropertySchemas(source: UntypedObject): PatternedSchema[];
export declare function findPatternedSchemaFor(patterns: PatternedSchema[], name: string): PatternedSchema | undefined;
export declare function getPropertyNameError(name: string, reservedNames?: string[], schema?: FlagOrObject): string | undefined;
