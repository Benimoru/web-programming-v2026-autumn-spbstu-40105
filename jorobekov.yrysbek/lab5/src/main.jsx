import React, {useEffect, useMemo, useState} from 'react';
import {createRoot} from 'react-dom/client';
import './styles.css';

const Icon = ({name, size = 16}) => {
  const paths = {
    Plus: <path d="M12 5v14M5 12h14" />,
    Search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    MoreHorizontal: (
      <>
        <circle cx="5" cy="12" r="1" />
        <circle cx="12" cy="12" r="1" />
        <circle cx="19" cy="12" r="1" />
      </>
    ),
    Pencil: (
      <>
        <path d="m16 4 4 4L9 19l-5 1 1-5Z" />
        <path d="m14 6 4 4" />
      </>
    ),
    Trash2: (
      <>
        <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
        <path d="M10 11v5M14 11v5" />
      </>
    ),
    X: <path d="m18 6-12 12M6 6l12 12" />,
    Check: <path d="m5 12 4 4L19 6" />,
    CalendarDays: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 11h18" />
      </>
    ),
    Circle: <circle cx="12" cy="12" r="9" />,
    Clock3: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l4 2" />
      </>
    ),
    CheckCircle2: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m8 12 3 3 5-6" />
      </>
    ),
    LayoutGrid: (
      <>
        <rect x="3" y="3" width="8" height="8" rx="1" />
        <rect x="13" y="3" width="8" height="8" rx="1" />
        <rect x="3" y="13" width="8" height="8" rx="1" />
        <rect x="13" y="13" width="8" height="8" rx="1" />
      </>
    ),
    GripVertical: (
      <>
        <circle cx="9" cy="5" r="1" />
        <circle cx="15" cy="5" r="1" />
        <circle cx="9" cy="12" r="1" />
        <circle cx="15" cy="12" r="1" />
        <circle cx="9" cy="19" r="1" />
        <circle cx="15" cy="19" r="1" />
      </>
    ),
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
};

const STORAGE_KEY = 'lab5-kanban-board-v1';

const initialColumns = [
  {id: 'todo', title: 'Сделать', color: '#64748b', icon: 'Circle'},
  {id: 'progress', title: 'В процессе', color: '#e59b32', icon: 'Clock3'},
  {id: 'done', title: 'Готово', color: '#239b72', icon: 'CheckCircle2'},
];

const initialTasks = [
  {
    id: 'task-1',
    title: 'Продумать структуру проекта',
    description: 'Определить компоненты и основные сценарии приложения.',
    status: 'todo',
    priority: 'Высокий',
    dueDate: '',
    createdAt: Date.now() - 5000,
  },
  {
    id: 'task-2',
    title: 'Сверстать канбан-доску',
    description: 'Сделать колонки и карточки адаптивными.',
    status: 'progress',
    priority: 'Средний',
    dueDate: '',
    createdAt: Date.now() - 4000,
  },
  {
    id: 'task-3',
    title: 'Подготовить требования',
    description: 'Проверить список функциональных требований лабораторной.',
    status: 'done',
    priority: 'Низкий',
    dueDate: '',
    createdAt: Date.now() - 3000,
  },
];

function readSavedTasks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return initialTasks;
    }
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : initialTasks;
  } catch {
    return initialTasks;
  }
}

function formatDate(date) {
  if (!date) {
    return '';
  }
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return '';
  }
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short',
  }).format(parsed);
}

function TaskModal({task, initialStatus = 'todo', onClose, onSave}) {
  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [priority, setPriority] = useState(task?.priority ?? 'Средний');
  const [dueDate, setDueDate] = useState(task?.dueDate ?? '');
  const [status, setStatus] = useState(task?.status ?? initialStatus);
  const [error, setError] = useState('');

  function submit(event) {
    event.preventDefault();
    if (!title.trim()) {
      setError('Введите название задачи.');
      return;
    }
    onSave({
      ...(task ?? {}),
      id:
        task?.id ?? `task-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      title: title.trim(),
      description: description.trim(),
      priority,
      dueDate,
      status,
      createdAt: task?.createdAt ?? Date.now(),
    });
  }

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <form className="task-modal" onSubmit={submit}>
        <div className="modal-heading">
          <div>
            <p className="eyebrow">
              {task ? 'ИЗМЕНИТЬ КАРТОЧКУ' : 'НОВАЯ КАРТОЧКА'}
            </p>
            <h2>{task ? 'Редактирование задачи' : 'Создать задачу'}</h2>
          </div>
          <button
            className="icon-button"
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
          >
            <Icon name="X" size={19} />
          </button>
        </div>

        <label className="field-label">
          Название задачи <span className="required">*</span>
          <input
            autoFocus
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
              setError('');
            }}
            placeholder="Например, подготовить макет"
            maxLength={100}
          />
        </label>

        <label className="field-label">
          Описание
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Что нужно сделать?"
            rows={3}
            maxLength={500}
          />
        </label>

        <div className="field-grid">
          <label className="field-label">
            Приоритет
            <select
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
            >
              <option>Низкий</option>
              <option>Средний</option>
              <option>Высокий</option>
            </select>
          </label>
          <label className="field-label">
            Срок выполнения
            <input
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
            />
          </label>
        </div>

        <label className="field-label">
          Колонка
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            {initialColumns.map((column) => (
              <option value={column.id} key={column.id}>
                {column.title}
              </option>
            ))}
          </select>
        </label>

        {error && <p className="form-error">{error}</p>}
        <div className="modal-actions">
          <button
            type="button"
            className="button button-secondary"
            onClick={onClose}
          >
            Отмена
          </button>
          <button type="submit" className="button button-primary">
            <Icon name="Check" size={16} />{' '}
            {task ? 'Сохранить' : 'Создать задачу'}
          </button>
        </div>
      </form>
    </div>
  );
}

function TaskCard({task, onEdit, onDelete, onDragStart, onDragEnd}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const priorityClass =
    {
      Высокий: 'priority-high',
      Средний: 'priority-medium',
      Низкий: 'priority-low',
    }[task.priority] ?? 'priority-medium';

  return (
    <article
      className="task-card"
      draggable
      onDragStart={(event) => onDragStart(event, task)}
      onDragEnd={onDragEnd}
    >
      <div className="card-topline">
        <span className={`priority ${priorityClass}`}>
          <span />
          {task.priority}
        </span>
        <div className="card-menu-wrap">
          <button
            className="icon-button card-menu-button"
            type="button"
            aria-label="Действия с карточкой"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <Icon name="MoreHorizontal" size={19} />
          </button>
          {menuOpen && (
            <div className="card-menu">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onEdit(task);
                }}
              >
                <Icon name="Pencil" size={14} /> Редактировать
              </button>
              <button
                className="danger-action"
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onDelete(task);
                }}
              >
                <Icon name="Trash2" size={14} /> Удалить
              </button>
            </div>
          )}
        </div>
      </div>
      <h3>{task.title}</h3>
      {task.description && (
        <p className="task-description">{task.description}</p>
      )}
      <div className="card-footer">
        <span className="task-id">
          <Icon name="GripVertical" size={14} />{' '}
          {task.id.slice(-6).toUpperCase()}
        </span>
        {task.dueDate && (
          <span className="due-date">
            <Icon name="CalendarDays" size={13} />
            {formatDate(task.dueDate)}
          </span>
        )}
      </div>
    </article>
  );
}

function App() {
  const [tasks, setTasks] = useState(readSavedTasks);
  const [modalTask, setModalTask] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [draggedId, setDraggedId] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    const value = search.trim().toLowerCase();
    if (!value) {
      return tasks;
    }
    return tasks.filter((task) =>
      `${task.title} ${task.description} ${task.priority}`
        .toLowerCase()
        .includes(value),
    );
  }, [tasks, search]);

  const completedCount = tasks.filter((task) => task.status === 'done').length;

  function showToast(message) {
    setToast(message);
    window.setTimeout(() => setToast(''), 2400);
  }

  function saveTask(task) {
    setTasks((current) => {
      const exists = current.some((item) => item.id === task.id);
      return exists
        ? current.map((item) => (item.id === task.id ? task : item))
        : [...current, task];
    });
    setModalOpen(false);
    setModalTask(null);
    showToast(modalTask?.id ? 'Изменения сохранены' : 'Задача создана');
  }

  function editTask(task) {
    setModalTask(task);
    setModalOpen(true);
  }

  function deleteTask(task) {
    if (!window.confirm(`Удалить задачу «${task.title}»?`)) {
      return;
    }
    setTasks((current) => current.filter((item) => item.id !== task.id));
    showToast('Задача удалена');
  }

  function startCreate(status = 'todo') {
    setModalTask({status, priority: 'Средний'});
    setModalOpen(true);
  }

  function handleDragStart(event, task) {
    setDraggedId(task.id);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', task.id);
  }

  function handleDrop(event, status) {
    event.preventDefault();
    const id = event.dataTransfer.getData('text/plain') || draggedId;
    if (id) {
      setTasks((current) =>
        current.map((task) => (task.id === id ? {...task, status} : task)),
      );
    }
    setDraggedId(null);
    setDragOverColumn(null);
  }

  return (
    <div className="app-shell">
      <main className="main-content">
        <header className="page-header">
          <h1>Канбан-доска</h1>
        </header>

        <section className="board-heading">
          <div>
            <div className="eyebrow">МОЙ ПРОЕКТ</div>
            <h1>
              Канбан-доска <span className="title-emoji">✳</span>
            </h1>
            <p className="board-subtitle">
              Планируйте задачи, отслеживайте прогресс и доводите дела до
              результата.
            </p>
          </div>
          <button
            className="button button-primary create-main"
            onClick={() => startCreate('todo')}
          >
            <Icon name="Plus" size={17} /> Новая задача
          </button>
        </section>

        <section className="board-toolbar">
          <div className="board-tabs">
            <button className="tab active">
              <Icon name="LayoutGrid" size={15} /> Доска
            </button>
            <span className="tab-divider" />
            <span className="task-total">{tasks.length} задач</span>
          </div>
          <div className="toolbar-right">
            <label className="search-box">
              <Icon name="Search" size={16} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Поиск задач..."
              />
              <kbd>⌘ K</kbd>
            </label>
          </div>
        </section>

        <section className="board" aria-label="Канбан-доска">
          {initialColumns.map((column) => {
            const columnTasks = filteredTasks.filter(
              (task) => task.status === column.id,
            );

            return (
              <section
                className={`board-column ${dragOverColumn === column.id ? 'drag-over' : ''}`}
                key={column.id}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragOverColumn(column.id);
                }}
                onDragLeave={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget)) {
                    setDragOverColumn(null);
                  }
                }}
                onDrop={(event) => handleDrop(event, column.id)}
              >
                <div className="column-heading">
                  <div className="column-title-wrap">
                    <span className="column-icon" style={{color: column.color}}>
                      <Icon name={column.icon} size={17} />
                    </span>
                    <h2>{column.title}</h2>
                    <span className="column-count">{columnTasks.length}</span>
                  </div>
                  <button
                    className="icon-button column-add"
                    aria-label={`Добавить задачу: ${column.title}`}
                    onClick={() => startCreate(column.id)}
                  >
                    <Icon name="Plus" size={18} />
                  </button>
                </div>
                <div className="column-cards">
                  {columnTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={editTask}
                      onDelete={deleteTask}
                      onDragStart={handleDragStart}
                      onDragEnd={() => {
                        setDraggedId(null);
                        setDragOverColumn(null);
                      }}
                    />
                  ))}
                  {columnTasks.length === 0 && (
                    <div className="empty-column">
                      <span>
                        <Icon name="Plus" size={17} />
                      </span>
                      <p>
                        {search
                          ? 'Ничего не найдено'
                          : 'Перетащите задачу сюда'}
                      </p>
                    </div>
                  )}
                  <button
                    className="add-card-button"
                    onClick={() => startCreate(column.id)}
                  >
                    <Icon name="Plus" size={16} /> Добавить карточку
                  </button>
                </div>
              </section>
            );
          })}
        </section>

        <footer className="board-footer">
          <span>
            <span className="footer-dot" /> Все изменения сохраняются
            автоматически
          </span>
          <span>
            {completedCount} из {tasks.length} задач завершено
          </span>
        </footer>
      </main>

      {modalOpen && (
        <TaskModal
          task={modalTask?.id ? modalTask : null}
          initialStatus={modalTask?.status ?? 'todo'}
          onClose={() => {
            setModalOpen(false);
            setModalTask(null);
          }}
          onSave={saveTask}
        />
      )}
      {toast && (
        <div className="toast">
          <Icon name="CheckCircle2" size={17} />
          {toast}
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
