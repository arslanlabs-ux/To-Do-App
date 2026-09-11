// Pure to-do logic. Works as a browser global (window.Todo) and a Node module (for tests).

const STORAGE_KEY = 'todo-app:tasks';

const uid = () =>
    globalThis.crypto && globalThis.crypto.randomUUID
        ? globalThis.crypto.randomUUID()
        : 't' + Date.now() + Math.random().toString(36).slice(2);

const createTask = (text) => ({ id: uid(), text, done: false });

function addTask(tasks, text) {
    const t = String(text ?? '').trim();
    if (!t) return { ok: false, tasks };
    return { ok: true, tasks: [...tasks, createTask(t)] };
}

const toggleTask = (tasks, id) => tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
const removeTask = (tasks, id) => tasks.filter((t) => t.id !== id);
const clearDone = (tasks) => tasks.filter((t) => !t.done);
const remaining = (tasks) => tasks.filter((t) => !t.done).length;

function filterTasks(tasks, filter) {
    if (filter === 'active') return tasks.filter((t) => !t.done);
    if (filter === 'done') return tasks.filter((t) => t.done);
    return tasks;
}

// Persistence. Guarded so Node tests can run without localStorage.
function loadTasks() {
    if (typeof localStorage === 'undefined') return [];
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? []; }
    catch { return []; }
}
function saveTasks(tasks) {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

const Todo = { createTask, addTask, toggleTask, removeTask, clearDone, filterTasks, remaining, loadTasks, saveTasks, STORAGE_KEY };
if (typeof module !== 'undefined' && module.exports) module.exports = Todo;
if (typeof window !== 'undefined') window.Todo = Todo;
