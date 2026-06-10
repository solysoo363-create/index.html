// DOM Elements
const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const filterBtns = document.querySelectorAll('.filter-btn');
const clearBtn = document.getElementById('clearBtn');
const totalTasksSpan = document.getElementById('totalTasks');
const completedTasksSpan = document.getElementById('completedTasks');
const emptyState = document.getElementById('emptyState');

// LocalStorage Key
const STORAGE_KEY = 'todoAppTasks';

// Current Filter
let currentFilter = 'all';

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    addEventListeners();
});

// Add Event Listeners
function addEventListeners() {
    addBtn.addEventListener('click', addTask);
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.dataset.filter;
            renderTasks();
        });
    });

    clearBtn.addEventListener('click', clearCompletedTasks);
}

// Add New Task
function addTask() {
    const text = todoInput.value.trim();

    if (!text) {
        alert('Please enter a task!');
        todoInput.focus();
        return;
    }

    if (text.length > 100) {
        alert('Task is too long! Maximum 100 characters.');
        return;
    }

    const task = {
        id: Date.now(),
        text: text,
        completed: false,
        createdAt: new Date().toISOString()
    };

    const tasks = getTasks();
    tasks.push(task);
    saveTasks(tasks);

    todoInput.value = '';
    todoInput.focus();
    renderTasks();
}

// Get Tasks from LocalStorage
function getTasks() {
    const tasks = localStorage.getItem(STORAGE_KEY);
    return tasks ? JSON.parse(tasks) : [];
}

// Save Tasks to LocalStorage
function saveTasks(tasks) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    updateStats();
}

// Load Tasks
function loadTasks() {
    renderTasks();
}

// Render Tasks
function renderTasks() {
    const tasks = getTasks();
    todoList.innerHTML = '';

    let filteredTasks = tasks;

    if (currentFilter === 'active') {
        filteredTasks = tasks.filter(task => !task.completed);
    } else if (currentFilter === 'completed') {
        filteredTasks = tasks.filter(task => task.completed);
    }

    if (filteredTasks.length === 0) {
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');

    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.innerHTML = `
            <input 
                type="checkbox" 
                class="checkbox" 
                ${task.completed ? 'checked' : ''}
                onchange="toggleTask(${task.id})"
            >
            <span class="todo-text ${task.completed ? 'completed' : ''}">
                ${escapeHtml(task.text)}
            </span>
            <button class="btn-delete" onclick="deleteTask(${task.id})">Delete</button>
        `;
        todoList.appendChild(li);
    });
}

// Toggle Task Completion
function toggleTask(id) {
    const tasks = getTasks();
    const task = tasks.find(t => t.id === id);

    if (task) {
        task.completed = !task.completed;
        saveTasks(tasks);
        renderTasks();
    }
}

// Delete Task
function deleteTask(id) {
    if (confirm('Are you sure you want to delete this task?')) {
        const tasks = getTasks();
        const filteredTasks = tasks.filter(t => t.id !== id);
        saveTasks(filteredTasks);
        renderTasks();
    }
}

// Clear Completed Tasks
function clearCompletedTasks() {
    const tasks = getTasks();
    const completedCount = tasks.filter(t => t.completed).length;

    if (completedCount === 0) {
        alert('No completed tasks to clear!');
        return;
    }

    if (confirm(`Clear ${completedCount} completed task(s)?`)) {
        const filteredTasks = tasks.filter(t => !t.completed);
        saveTasks(filteredTasks);
        renderTasks();
    }
}

// Update Statistics
function updateStats() {
    const tasks = getTasks();
    const completed = tasks.filter(t => t.completed).length;

    totalTasksSpan.textContent = `Tasks: ${tasks.length}`;
    completedTasksSpan.textContent = `Completed: ${completed}`;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initial Stats Update
updateStats();
