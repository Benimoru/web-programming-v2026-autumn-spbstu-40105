export class Programmer {
  constructor(id, name, languages = []) {
    this.id = id;
    this.name = name;
    this.languages = [...languages];
  }

  addLanguage(language) {
    const value = language.trim();

    if (value === '') {
      return;
    }

    if (!this.languages.includes(value)) {
      this.languages.push(value);
    }
  }

  removeLanguage(language) {
    this.languages = this.languages.filter((item) => item !== language);
  }

  get languageCount() {
    return this.languages.length;
  }
}

export function groupProgrammersByLanguage(programmers) {
  const result = new Map();

  programmers.forEach((programmer) => {
    programmer.languages.forEach((language) => {
      if (!result.has(language)) {
        result.set(language, []);
      }

      result.get(language).push(programmer);
    });
  });

  return result;
}

export function getAllLanguages(programmers) {
  const languages = new Set();

  programmers.forEach((programmer) => {
    programmer.languages.forEach((language) => {
      languages.add(language);
    });
  });

  return languages;
}

export function getProgrammersByLanguage(programmers, language) {
  return programmers.filter((programmer) =>
    programmer.languages.includes(language),
  );
}

export function groupByLanguageCount(programmers) {
  const result = new Map();

  programmers.forEach((programmer) => {
    const count = programmer.languageCount;

    if (!result.has(count)) {
      result.set(count, []);
    }

    result.get(count).push(programmer);
  });

  return result;
}

export function getProgrammersWithMaxLanguages(programmers) {
  if (programmers.length === 0) {
    return [];
  }

  const maxCount = Math.max(
    ...programmers.map((programmer) => programmer.languageCount),
  );

  return programmers.filter(
    (programmer) => programmer.languageCount === maxCount,
  );
}
