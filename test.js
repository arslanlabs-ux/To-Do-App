// Core logic check. Run: node test.js
const assert = require('assert');
const Todo = require('./tasks.js');

let res = Todo.addTask([], 'Buy milk');
assert.equal(res.ok, true);
assert.equal(res.tasks.length, 1);
assert.equal(res.tasks[0].text, 'Buy milk');
assert.equal(res.tasks[0].done, false);

// Blank / whitespace-only input is rejected.
res = Todo.addTask(res.tasks, '   ');
assert.equal(res.ok, false);
assert.equal(res.tasks.length, 1);

// Input is trimmed.
res = Todo.addTask(res.tasks, '  Write test  ');
assert.equal(res.tasks[1].text, 'Write test');

let tasks = res.tasks;

// Toggle completion.
tasks = Todo.toggleTask(tasks, tasks[0].id);
assert.equal(tasks[0].done, true);
assert.equal(Todo.remaining(tasks), 1);

// Filters.
assert.equal(Todo.filterTasks(tasks, 'active').length, 1);
assert.equal(Todo.filterTasks(tasks, 'done').length, 1);
assert.equal(Todo.filterTasks(tasks, 'all').length, 2);

// Remove by id.
const gone = tasks[0].id;
tasks = Todo.removeTask(tasks, gone);
assert.equal(tasks.length, 1);
assert.ok(!tasks.some((t) => t.id === gone));

// Clear completed.
tasks = Todo.toggleTask(tasks, tasks[0].id);
tasks = Todo.clearDone(tasks);
assert.equal(tasks.length, 0);

console.log('All tests passed ✓');
