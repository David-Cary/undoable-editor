export function echoKeyText(key, context) {
    if (typeof context === 'string') {
        return context;
    }
    if (Array.isArray(key)) {
        if (key.length > 0)
            return key[0];
    }
    else {
        return key;
    }
    return '';
}
export class KeyedTextTranslator {
    translations;
    constructor(translations = {}) {
        this.translations = translations;
    }
    translate(key) {
        if (Array.isArray(key)) {
            const text = key.find((item) => this.translations[item] != null);
            return text ?? key[0] ?? '';
        }
        return this.translations[key] ?? key;
    }
}
