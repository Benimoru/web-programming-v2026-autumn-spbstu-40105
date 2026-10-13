
const STORAGE_KEY = "notes_lab5";

const noteForm = document.querySelector("#note-form");
const noteIdInput = document.querySelector("#note-id");
const titleInput = document.querySelector("#note-title");
const contentInput = document.querySelector("#note-content");
const tagsInput = document.querySelector("#note-tags");
const formTitle = document.querySelector("#form-title");
const saveButton = document.querySelector("#save-button");
const cancelButton = document.querySelector("#cancel-button");
const searchInput = document.querySelector("#search-input");
const tagFilter = document.querySelector("#tag-filter");
const dateFilter = document.querySelector("#date-filter");
const resetFiltersButton = document.querySelector("#reset-filters");
const tagList = document.querySelector("#tag-list");
const notesList = document.querySelector("#notes-list");
const notesCount = document.querySelector("#notes-count");
const emptyMessage = document.querySelector("#empty-message");

let notes = loadNotes();

function loadNotes() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch {
        return [];
    }
}

function saveNotes() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

function createId() {
    return Date.now().toString() + Math.random().toString(16).slice(2);
}

function parseTags(value) {
    return [...new Set(
        value
            .split(",")
            .map(tag => tag.trim())
            .filter(tag => tag !== "")
    )];
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function formatDate(value) {
    return new Date(value).toLocaleString("ru-RU");
}

function resetForm() {
    noteForm.reset();
    noteIdInput.value = "";
    formTitle.textContent = "Новая заметка";
    saveButton.textContent = "Сохранить";
    cancelButton.hidden = true;
}

function updateTagFilter() {
    const selectedTag = tagFilter.value;
    const allTags = [...new Set(notes.flatMap(note => note.tags))];

    tagFilter.innerHTML = '<option value="">Все теги</option>';

    allTags.sort((a, b) => a.localeCompare(b, "ru"));

    allTags.forEach(tag => {
        const option = document.createElement("option");
        option.value = tag;
        option.textContent = tag;
        tagFilter.appendChild(option);
    });

    if (allTags.includes(selectedTag)) {
        tagFilter.value = selectedTag;
    }
}

function renderTagList() {
    const allTags = [...new Set(notes.flatMap(note => note.tags))];

    tagList.innerHTML = allTags
        .sort((a, b) => a.localeCompare(b, "ru"))
        .map(tag => `<span class="tag">${escapeHtml(tag)}</span>`)
        .join("");
}

function getFilteredNotes() {
    const query = searchInput.value.trim().toLowerCase();
    const selectedTag = tagFilter.value;
    const selectedDate = dateFilter.value;

    return notes
        .filter(note => {
            const text = `${note.title} ${note.content}`.toLowerCase();
            const matchesSearch = text.includes(query);
            const matchesTag =
                selectedTag === "" || note.tags.includes(selectedTag);

            const noteDate = new Date(note.createdAt);
            const matchesDate =
                selectedDate === "" ||
                noteDate >= new Date(`${selectedDate}T00:00:00`);

            return matchesSearch && matchesTag && matchesDate;
        })
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

function renderNotes() {
    updateTagFilter();
    renderTagList();

    const filteredNotes = getFilteredNotes();

    notesCount.textContent =
        `Показано заметок: ${filteredNotes.length} из ${notes.length}`;

    emptyMessage.hidden = filteredNotes.length > 0;
    emptyMessage.textContent = notes.length === 0
        ? "Заметок пока нет. Создай первую!"
        : "По заданным условиям заметки не найдены.";

    notesList.innerHTML = filteredNotes.map(note => `
        <article class="note-card">
            <h3>${escapeHtml(note.title)}</h3>
            <p class="note-date">
                Создана: ${escapeHtml(formatDate(note.createdAt))}
            </p>
            <p class="note-date">
                Изменена: ${escapeHtml(formatDate(note.updatedAt))}
            </p>
            <p class="note-content">${escapeHtml(note.content)}</p>
            <div class="note-tags">
                ${note.tags.map(tag =>
                    `<span class="tag">${escapeHtml(tag)}</span>`
                ).join("")}
            </div>
            <div class="note-buttons">
                <button type="button" data-action="edit"
                    data-id="${escapeHtml(note.id)}">Изменить</button>
                <button type="button" class="delete-button"
                    data-action="delete"
                    data-id="${escapeHtml(note.id)}">Удалить</button>
            </div>
        </article>
    `).join("");
}

noteForm.addEventListener("submit", event => {
    event.preventDefault();

    const title = titleInput.value.trim();
    const content = contentInput.value.trim();
    const tags = parseTags(tagsInput.value);

    if (!title || !content) {
        alert("Заполни заголовок и содержание заметки.");
        return;
    }

    const existingId = noteIdInput.value;
    const now = new Date().toISOString();

    if (existingId) {
        const note = notes.find(item => item.id === existingId);

        if (note) {
            note.title = title;
            note.content = content;
            note.tags = tags;
            note.updatedAt = now;
        }
    } else {
        notes.push({
            id: createId(),
            title,
            content,
            tags,
            createdAt: now,
            updatedAt: now
        });
    }

    saveNotes();
    resetForm();
    renderNotes();
});

cancelButton.addEventListener("click", resetForm);

notesList.addEventListener("click", event => {
    const button = event.target.closest("button[data-action]");

    if (!button) {
        return;
    }

    const note = notes.find(item => item.id === button.dataset.id);

    if (!note) {
        return;
    }

    if (button.dataset.action === "edit") {
        noteIdInput.value = note.id;
        titleInput.value = note.title;
        contentInput.value = note.content;
        tagsInput.value = note.tags.join(", ");

        formTitle.textContent = "Редактирование заметки";
        saveButton.textContent = "Сохранить изменения";
        cancelButton.hidden = false;

        titleInput.focus();
    }

    if (button.dataset.action === "delete") {
        if (confirm(`Удалить заметку «${note.title}»?`)) {
            notes = notes.filter(item => item.id !== note.id);

            saveNotes();
            resetForm();
            renderNotes();
        }
    }
});

searchInput.addEventListener("input", renderNotes);
tagFilter.addEventListener("change", renderNotes);
dateFilter.addEventListener("change", renderNotes);

resetFiltersButton.addEventListener("click", () => {
    searchInput.value = "";
    tagFilter.value = "";
    dateFilter.value = "";
    renderNotes();
});

renderNotes();
