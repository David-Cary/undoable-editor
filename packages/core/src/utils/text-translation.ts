export type GetKeyedText = (
  key: string | string[],
  context?: string | Record<string, any>
) => string

export function echoKeyText(
  key: string | string[],
  context?: string | Record<string, any>
): string {
  if (typeof context === 'string') {
    return context
  }
  if (Array.isArray(key)) {
    if (key.length > 0) return key[0]
  } else {
    return key
  }
  return ''
}

export interface TextTranslator {
  translate: GetKeyedText
}

export class KeyedTextTranslator implements TextTranslator {
  translations: Record<string, string>

  constructor(translations: Record<string, string> = {}) {
    this.translations = translations
  }

  translate(key: string | string[]): string {
    if (Array.isArray(key)) {
      const text = key.find((item) => this.translations[item] != null)
      return text ?? key[0] ?? ''
    }
    return this.translations[key] ?? key
  }
}
