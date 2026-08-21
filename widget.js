// ウィジェットのタスクリスト
const widgetTodoList = document.getElementById('widget-todo-list');

// 今日の日付の取得
function getTodayDate() {

    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    return '${year}-${month}-${day}';

}

// 今日のタスクを読み込む
function loadTodayTodos() {

    widgetTodoList.innerHTML = '';

    const todos = localStorage.getItem('todos')
        ? JSON.parse(localStorage.getItem('todos'))
        : [];

    const today = getTodayDate();

    // 今日が期限のみ完了タスクだけ取得
    const todayTodos = todos.filter(todo => {

        return todo.date === today && !todo.isCompleted;

    });

    // タスクを表示
    todayTodos.forEach(todo => {

        const li = document.createElement('li');

        //チェックボックス
        const checkbox = document.createElement('input');

        checkbox.type = 'checkbox';

        // タスク文字
        const span = document.createElement('span');

        span.textContent = todo.text;

        // チェックした時
        checkbox.addEventListener('change', () => {

            if (checkbox.checked) {
                todo.isCompleted = true;
                saveTodos(todos);
                li.remove();
            }
        });

        li.appendChild(checkbox);li.appendChild(span);

        widgetTodoList.appendChild(li);
    });
}

// LocalStorageへの保存
function saveTodos(todos) {

    localStorage.setItem(
        'todos',
        JSON.stringify(todos)
    );
}

// ウィジェット起動
loadTodayTodos();