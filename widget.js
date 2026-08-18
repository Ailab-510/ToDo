const { create } = require("node:domain");

const widgetList = document.getElementById('widget-todo-list');

function loadWidgetTodos() {

    const todos = localStorage.getItem('todos')
        ? JSON.parse(localStorage.getItem('todos'))
        : [];

    widgetList.innerHTML = '';

    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    const todayText = '${year}-${month}-${day}';

    const todayTodos = todos.filter(todo => {
        return todo.date === todayText && !todo.isCompleted;
    });

    todayTodos.array.forEach(todo => {
        createWidgetTodo(todo);
    });

}

function createWidgetTodo(todo) {

    const li = document.createElement('li');

    const checkbox = document.createElement('input');

    checkbox.type = 'checkbox';

    const span = document.createElement('span');

    span.classList.add('widget-task-text');

    span.textContent = todo.text;

    checkbox.addEventListener('change',() => {

        if (!checkbox.checked) return;

        updateTodoStatus(todo.text, true);

        li.remove();
    });

    li.appendChild(checkbox);
    li.appendChild(span);

    widgetList.appendChild(li);
}

function updateTodoStatus(taskText, isCompleted) {

    let todos = localStorage.getItem('todos')
        ? JSON.parse(localStorage.getItem('todos'))
        : [];

    todos = todos.map(todo => {

        if (todo.text === taskText) {
            todo.isCompleted = isCompleted;
        }

        return todo;
    });

    localStorage.setItem('todos',JSON.stringify(todos));
}

loadWidgetTodos();