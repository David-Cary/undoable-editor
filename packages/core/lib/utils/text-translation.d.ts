export type GetKeyedText = (key: string | string[], context?: string | Record<string, any>) => string;
export declare function echoKeyText(key: string | string[], context?: string | Record<string, any>): string;
export interface TextTranslator {
    translate: GetKeyedText;
}
export declare class KeyedTextTranslator implements TextTranslator {
    translations: Record<string, string>;
    constructor(translations?: Record<string, string>);
    translate(key: string | string[]): string;
}
