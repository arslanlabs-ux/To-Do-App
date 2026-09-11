const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const list = document.getElementById('todo-list');
const empty = document.getElementById('empty-state');
const count = document.getElementById('count');
const clearBtn = document.getElementById('clear-done');
const filterBtns = [...document.querySelectorAll('.filters button')];

let tasks = Todo.loadTasks();
let filter = 'all';

function render() {
    list.textContent = '';
    const shown = Todo.filterTasks(tasks, filter);
    empty.hidden = shown.length > 0;

    for (const t of shown) {
        const li = document.createElement('li');
        if (t.done) li.classList.add('done');

        const check = document.createElement('button');
        check.className = 'check';
        check.setAttribute('aria-label', t.done ? 'Mark as incomplete' : 'Mark as complete');

        const label = document.createElement('span');
        label.className = 'text';
        label.textContent = t.text;

        const del = document.createElement('button');
        del.className = 'delete';
        del.textContent = '×';
        del.setAttribute('aria-label', 'Delete task');

        li.append(check, label, del);
        li.addEventListener('click', (e) => {
            if (e.target === del) tasks = Todo.removeTask(tasks, t.id);
            else tasks = Todo.toggleTask(tasks, t.id);
            commit();
        });
        list.append(li);
    }

    const left = Todo.remaining(tasks);
    count.textContent = `${left} task${left === 1 ? '' : 's'} left`;
    clearBtn.disabled = left === tasks.length;
}

function commit() {
    Todo.saveTasks(tasks);
    render();
}

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const res = Todo.addTask(tasks, input.value);
    if (!res.ok) { input.focus(); return; }
    tasks = res.tasks;
    input.value = '';
    if (filter !== 'all') {
        filter = 'all';
        filterBtns.forEach((b) => b.classList.toggle('active', b.dataset.filter === filter));
    }
    commit();
});

filterBtns.forEach((b) =>
    b.addEventListener('click', () => {
        filter = b.dataset.filter;
        filterBtns.forEach((x) => x.classList.toggle('active', x === b));
        render();
    })
);

clearBtn.addEventListener('click', () => {
    tasks = Todo.clearDone(tasks);
    commit();
});

render();

// PWA: register the service worker (served over HTTPS or localhost).
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js'));
}
