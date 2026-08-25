// ウィジェットのタスクリスト
const widgetTodoList = document.getElementById('widget-todo-list');
const widget = document.getElementById('widget');
const dragBar = document.getElementById('drag-bar');

// ウィジェットの空白部分をクリック
widget.addEventListener('click', (event) => {

    // ドラッグバーは何もない
    if (event.target.closest('#drag-bar')) {
        return;
    }

    // タスク部分何もしない
    if (event.target.closest('#widget-todo-list')) {
        return;
    }

    window.electronAPI.openMainWindow();

})

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
        checkbox.addEventListener('click', (event) => {
            
            // クリックがliに伝わるのを防ぐ
            event.stopPropagation();
        });
        
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