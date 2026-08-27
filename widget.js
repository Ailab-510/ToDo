// ウィジェットのタスクリスト
const widgetTodoList = document.getElementById('widget-todo-list');
const widget = document.getElementById('widget');
const dragBar = document.getElementById('drag-bar');
const resizeHandle = document.getElementById('resize-handle');

// ウィジェットの空白部分をクリック
widget.addEventListener('click', (event) => {

    // ドラッグバーは何もしない
    if (event.target.closest('#drag-bar')) {
        return;
    }

    // サイズ変更部分は何もしない
    if (event.target.closest('#resize-handle')){
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

// ウィジェットのサイズ変更
let isResizing = false;

let resizeStartMouseX = 0;
let resizeStartMouseY = 0;

let resizeStartWidth = 250;
let resizeStartHeight = 250;

// サイズ変更開始
resizeHandle.addEventListener('mousedown', async (event) => {

    if (event.button !== 0) {
        return;
    }

    event.preventDefault();
    event.stopPropagation();

    isResizing = true;

    resizeStartMouseX = event.screenX;
    resizeStartMouseY = event.screenY;

    const size = await window.electronAPI.getWidgetSize();

        resizeStartWidth = size.width;
        resizeStartHeight = size.height;
    
});

// マウス移動
document.addEventListener('mousemove', (event) => {

    if (!isResizing) {
        return;
    }

    const moveX = event.screenX - resizeStartMouseX;
    const moveY = event.screenY - resizeStartMouseY;

    const newWidth = resizeStartWidth + moveX;
    const newHeight = resizeStartHeight + moveY;


    window.electronAPI.resizeWidget(
        newWidth,
        newHeight
    );

});

// マウスを離した
document.addEventListener('mouseup', (event) => {

    if(!isResizing) {
        return;
    }

    event.preventDefault();
    event.stopPropagation();

    isResizing = false;

});

// ウィジェット起動
loadTodayTodos();

window.electronAPI.onTodoChanged(() => {
    console.log('タスク変更通知を受領しました')
    loadTodayTodos();

});