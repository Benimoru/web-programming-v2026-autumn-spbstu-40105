import {
  Programmer,
  groupProgrammersByLanguage,
  getUniqueLanguages,
  getProgrammersByLanguage,
  groupByLanguageCount,
  getProgrammersWithMaxLanguages,
} from './model.js';

const STORAGE_KEY = 'programmers_lab4';

let programmers = loadProgrammers();

const entityList = document.querySelector('#entity-list');
const programmerForm = document.querySelector('#programmer-form');
const languageForm = document.querySelector('#language-form');
const programmerSelect = document.querySelector('#programmer-select');
const statistics = document.querySelector('#statistics');

function loadProgrammers() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return [
      new Programmer(1, 'Yrysbek', ['JavaScript', 'Python', 'C++']),
      new Programmer(2, 'Alex', ['JavaScript', 'Java']),
      new Programmer(3, 'Maria', ['Python', 'C#', 'JavaScript']),
    ];
  }

  try {
    return JSON.parse(saved).map(
      (item) => new Programmer(item.id, item.name, item.languages),
    );
  } catch {
    return [];
  }
}

function saveProgrammers() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(programmers));
}

function asyncOperation(operation) {
  return new Promise((resolve) => {
    setTimeout(() => {
      operation();
      resolve();
    }, 300);
  });
}

function render() {
  entityList.innerHTML = '';

  programmers.forEach((programmer) => {
    const card = document.createElement('article');

    card.className = 'programmer-card';
    card.dataset.id = programmer.id;

    card.innerHTML = `
            <h3>${escapeHtml(programmer.name)}</h3>

            <p>
                <strong>ID:</strong>
                ${programmer.id}
            </p>

            <p>
                <strong>Языки:</strong>
                ${
                  programmer.languages.length > 0
                    ? programmer.languages.map(escapeHtml).join(', ')
                    : 'Нет языков'
                }
            </p>

            <p>
                <strong>Количество языков:</strong>
                ${programmer.languageCount}
            </p>

            <button
                type="button"
                class="add-language-button"
                data-id="${programmer.id}">
                Добавить язык
            </button>

            <button
                type="button"
                class="remove-language-button"
                data-id="${programmer.id}">
                Удалить язык
            </button>

            <button
                type="button"
                class="delete-button"
                data-id="${programmer.id}">
                Удалить программиста
            </button>
        `;

    entityList.appendChild(card);
  });

  updateSelect();
  updateStatistics();
}

function updateSelect() {
  programmerSelect.innerHTML = '';

  programmers.forEach((programmer) => {
    const option = document.createElement('option');

    option.value = programmer.id;
    option.textContent = programmer.name;

    programmerSelect.appendChild(option);
  });
}

function updateStatistics() {
  const languages = getUniqueLanguages(programmers);
  const byLanguage = groupProgrammersByLanguage(programmers);
  const byCount = groupByLanguageCount(programmers);

  const maxProgrammers = getProgrammersWithMaxLanguages(programmers);

  let html = `
        <h2>Статистика</h2>

        <p>
            <strong>Всего программистов:</strong>
            ${programmers.length}
        </p>

        <p>
            <strong>Уникальные языки:</strong>
            ${languages.size}
        </p>

        <p>
            <strong>Языки:</strong>
            ${Array.from(languages).join(', ') || 'нет'}
        </p>

        <h3>Группировка по языкам</h3>
    `;

  byLanguage.forEach((items, language) => {
    html += `
            <p>
                <strong>${escapeHtml(language)}:</strong>
                ${items.map((item) => escapeHtml(item.name)).join(', ')}
            </p>
        `;
  });

  html += `
        <h3>Группировка по количеству языков</h3>
    `;

  byCount.forEach((items, count) => {
    html += `
            <p>
                <strong>${count}:</strong>
                ${items.map((item) => escapeHtml(item.name)).join(', ')}
            </p>
        `;
  });

  html += `
        <h3>Максимальное количество языков</h3>

        <p>
            ${
              maxProgrammers.map((item) => escapeHtml(item.name)).join(', ') ||
              'нет'
            }
        </p>
    `;

  statistics.innerHTML = html;
}

programmerForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const formData = new FormData(programmerForm);

  const id = Number(formData.get('id'));
  const name = String(formData.get('name')).trim();

  if (!id || !name) {
    return;
  }

  if (programmers.some((programmer) => programmer.id === id)) {
    alert('Программист с таким ID уже существует');
    return;
  }

  await asyncOperation(() => {
    programmers.push(new Programmer(id, name, []));

    saveProgrammers();
    render();
  });

  programmerForm.reset();
});

languageForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const formData = new FormData(languageForm);

  const programmerId = Number(formData.get('programmerId'));

  const language = String(formData.get('language')).trim();

  if (!language) {
    return;
  }

  await asyncOperation(() => {
    const programmer = programmers.find((item) => item.id === programmerId);

    if (programmer) {
      programmer.addLanguage(language);
    }

    saveProgrammers();
    render();
  });

  languageForm.reset();
});

entityList.addEventListener('click', async (event) => {
  const button = event.target;

  if (!button.dataset.id) {
    return;
  }

  const id = Number(button.dataset.id);

  if (button.classList.contains('add-language-button')) {
    const language = prompt('Введите язык программирования:');

    if (!language) {
      return;
    }

    await asyncOperation(() => {
      const programmer = programmers.find((item) => item.id === id);

      if (programmer) {
        programmer.addLanguage(language);
      }

      saveProgrammers();
      render();
    });
  }

  if (button.classList.contains('remove-language-button')) {
    const programmer = programmers.find((item) => item.id === id);

    if (!programmer) {
      return;
    }

    const language = prompt(
      `Введите язык для удаления:\n${programmer.languages.join(', ')}`,
    );

    if (!language) {
      return;
    }

    await asyncOperation(() => {
      programmer.removeLanguage(language);

      saveProgrammers();
      render();
    });
  }

  if (button.classList.contains('delete-button')) {
    await asyncOperation(() => {
      programmers = programmers.filter((item) => item.id !== id);

      saveProgrammers();
      render();
    });
  }
});

document.querySelector('#search-button').addEventListener('click', () => {
  const language = document.querySelector('#search-language').value.trim();

  if (!language) {
    render();
    return;
  }

  const result = getProgrammersByLanguage(programmers, language);

  entityList.innerHTML = '';

  result.forEach((programmer) => {
    const card = document.createElement('article');

    card.className = 'programmer-card';

    card.innerHTML = `
                <h3>
                    ${escapeHtml(programmer.name)}
                </h3>

                <p>
                    ID: ${programmer.id}
                </p>

                <p>
                    Языки:
                    ${programmer.languages.map(escapeHtml).join(', ')}
                </p>

                <p>
                    Количество языков:
                    ${programmer.languageCount}
                </p>
            `;

    entityList.appendChild(card);
  });
});

document.querySelector('#show-all-button').addEventListener('click', render);

window.addEventListener('beforeunload', saveProgrammers);

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

render();
