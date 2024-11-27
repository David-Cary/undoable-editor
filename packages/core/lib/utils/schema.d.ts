import { type ConversionFactory, type FlagOrObject } from 'schema-select';
export declare class TypeMappedValueFactory implements ConversionFactory<any, any, FlagOrObject> {
    typeValues: Record<string, any>;
    constructor(typeValues?: Record<string, any>);
    process(source: any, context?: FlagOrObject): any;
}
export declare class LookupViaSchemaProperty implements ConversionFactory<any, any, FlagOrObject> {
    property: string;
    values: Record<string, any>;
    constructor(property: string, values?: Record<string, any>);
    process(source: any, schema?: FlagOrObject): any;
}
