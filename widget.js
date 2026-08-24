// ウィジェットのタスクリスト
const widgetTodoList = document.getElementById('widget-todo-list');

// 今日の日付の取得
async function loadTodayTodos() {

    widgetTodoList.innerHTML = '';

    // 今日のタスクの取得
    const todayTodos = await window.electronAPI.getTodayTodos();

    // タスクを表示
    todayTodos.forEach(todo => {
        const li = document.createElement('li');

        // チェックボックス
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';

        // タスク文字
        const span = document.createElement('span');

        span.textContent = todo.text;
        span.classList.add('widget-task-text');

        // チェックされた時
        checkbox.addEventListener('change', async () => {

            if (checkbox.checked) {
                await window.electronAPI.completeTodo(todo.id);

                // ウィジェットから消す
                li.remove();
            }

        });

        li.appendChild(checkbox);
        li.appendChild(span);

        widgetTodoList.appendChild(li);
    });
}

// ウィジェット起動
loadTodayTodos();