const WORD_PATTERN = /[A-ZА-ЯЁ]+(?![a-zа-яё])|[A-ZА-ЯЁ]?[a-zа-яё]+|[0-9]+/g;

export function toAbbreviation(value) {
    if (typeof value !== "string") {
        throw new TypeError("Введите строку");
    }

    const parts = value.match(WORD_PATTERN) || [];

    return parts
        .map(part => part[0].toUpperCase())
        .join("");
}
