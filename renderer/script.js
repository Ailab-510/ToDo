// 画面の要素を取得
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const todoStartDate = document.getElementById('todo-start-date');
const todoDate = document.getElementById('todo-date');
const addTodoBtn = document.getElementById('add-todo-btn');

//　今どのメニューが開かれているかを覚えておくための変数
let currentFilter = 'all';

// 💡 1. ページ読み込み時に保存されたタスクを表示
window.addEventListener('DOMContentLoaded',loadTodos);

//　タスクを追加する処理の本体
function excuteAddTask(){
    const taskText = todoInput.value.trim();
    if(taskText === '')return;

    const startDate = todoStartDate.value ? todoStartDate.value : null;
    const deadline = todoDate.value ? todoDate.value : '期限なし';

    const now = new Date();
    const timeText = `${now.getMonth() + 1}/${now.getDate()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // 新しいタスクデータ（オブジェクト）を作る
    const newTodo = {
        id: Date.now(),
        text: taskText,
        isCompleted: false,
        time: timeText,
        startDate: startDate,
        date: deadline
    };

    createTodoElement(newTodo);
    saveTodo(newTodo);

    window.electronAPI.notifyTodoChanged();

    todoStartDate.blur();
    todoDate.blur();
    todoInput.value = '';
    todoStartDate.value = '';
    todoDate.value = '';
    todoInput.focus();
}

//　タスク入力欄でのEnterキーの処理
todoInput.addEventListener('keydown',(event) => {
    if (event.isComposing) return;
    if (event.key !== 'Enter') return;
    event.preventDefault();
    excuteAddTask();
});

//　期限入力欄でのEnterキーの処理
todoDate.addEventListener('keyup',(event) => {
    if (event.isComposing) return;
    if (event.key !== 'Enter') return;
    excuteAddTask();
});

// 確定ボタンをクリックした時の処理
addTodoBtn.addEventListener('click', () => {
    excuteAddTask();
});


// 💡 3. タスクを画面に作る関数
function createTodoElement(todoObj) {
    const li = document.createElement('li');

    li.dataset.id = todoObj.id;

    // 左側のコンテンツ（チェックボックス＋文字）を入れる親要素
    const taskContent = document.createElement('div');
    taskContent.classList.add('task-content');

    // チェックボックスを作る
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = todoObj.isCompleted;

    // タスクの文字を入れる要素
    const span = document.createElement('span');
    span.textContent = todoObj.text.trim();

    if(todoObj.isCompleted && currentFilter !== 'completed'){
        span.classList.add('completed');
    }

    const timeSpan = document.createElement('span');
    timeSpan.textContent = todoObj.time ? todoObj.time : '';
    timeSpan.classList.add('task-time');

    // 期限表示（開始日〜終了日 or 終了日のみ）
    const dateSpan = document.createElement('span');
    const endDate = todoObj.date || '期限なし';
    const startDate = todoObj.startDate || null;

    if (startDate && endDate !== '期限なし') {
        dateSpan.textContent = `〆: ${startDate} 〜 ${endDate}`;
    } else {
        dateSpan.textContent = `〆: ${endDate}`;
    }

    // データ属性に保存（編集・保存時に使う）
    dateSpan.dataset.startDate = startDate || '';
    dateSpan.dataset.endDate = endDate !== '期限なし' ? endDate : '';
    dateSpan.classList.add('todo-date');

    // チェックボックスがクリックされたときの動き
    checkbox.addEventListener('change', () => {
        updateTodoStatus(todoObj.id, checkbox.checked);

        if (checkbox.checked) {
            span.classList.add('completed');
        } else {
            span.classList.remove('completed');
        }

         setTimeout(() => {
            filterTodos(currentFilter);
        },200);
    });

    // 編集ボタンを作る
    const editBtn = document.createElement('button');
    editBtn.textContent = '編集';
    editBtn.classList.add('edit-btn');

    editBtn.addEventListener('click',() => {
        if (editBtn.textContent === '編集'){

            // テキスト編集フィールド
            const inputField = document.createElement('input');
            inputField.type = 'text';
            inputField.value = span.textContent;
            inputField.classList.add('edit-input');
            span.replaceWith(inputField);

            // 開始日・終了日の編集フィールド
            const startDateField = document.createElement('input');
            startDateField.type = 'date';
            startDateField.value = dateSpan.dataset.startDate || '';
            startDateField.classList.add('edit-start-date');

            const editSeparator = document.createElement('span');
            editSeparator.textContent = '〜';
            editSeparator.classList.add('date-separator');

            const endDateField = document.createElement('input');
            endDateField.type = 'date';
            endDateField.value = dateSpan.dataset.endDate || '';
            endDateField.classList.add('edit-date');

            const dateWrapper = document.createElement('div');
            dateWrapper.classList.add('edit-date-wrapper');
            dateWrapper.appendChild(startDateField);
            dateWrapper.appendChild(editSeparator);
            dateWrapper.appendChild(endDateField);
            dateSpan.replaceWith(dateWrapper);

            editBtn.textContent = '保存';

        }else{
            // テキストを戻す
            const inputField = taskContent.querySelector('.edit-input');
            if(inputField){
                span.textContent = inputField.value;
                inputField.replaceWith(span);
            }

            // 日付範囲を戻す
            const dateWrapper = taskContent.querySelector('.edit-date-wrapper');
            if(dateWrapper){
                const startDateField = dateWrapper.querySelector('.edit-start-date');
                const endDateField = dateWrapper.querySelector('.edit-date');

                const newStartDate = startDateField ? startDateField.value || null : null;
                const newEndDate = endDateField ? (endDateField.value || '期限なし') : '期限なし';

                if (newStartDate && newEndDate !== '期限なし') {
                    dateSpan.textContent = `〆: ${newStartDate} 〜 ${newEndDate}`;
                    dateSpan.dataset.startDate = newStartDate;
                    dateSpan.dataset.endDate = newEndDate;
                } else {
                    dateSpan.textContent = `〆: ${newEndDate}`;
                    dateSpan.dataset.startDate = '';
                    dateSpan.dataset.endDate = newEndDate !== '期限なし' ? newEndDate : '';
                }

                dateWrapper.replaceWith(dateSpan);
            }

            editBtn.textContent = '編集';
            saveAllTodos();
        }
    });

    // 削除ボタンを作る
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '削除';
    deleteBtn.classList.add('delete-btn');

    deleteBtn.addEventListener('click', () => {
        li.remove();
        deleteTodo(todoObj.id);
    });

    // 部品を組み立てる
    const leftGroup = document.createElement('div');
    leftGroup.classList.add('task-left');
    leftGroup.appendChild(checkbox);
    leftGroup.appendChild(span);

    const rightGroup = document.createElement('div');
    rightGroup.classList.add('task-right');
    rightGroup.appendChild(dateSpan);
    rightGroup.appendChild(timeSpan);

    taskContent.appendChild(leftGroup);
    taskContent.appendChild(rightGroup);

    li.appendChild(taskContent);
    li.appendChild(editBtn);
    li.appendChild(deleteBtn);

    todoList.appendChild(li);
}

// --- LocalStorage（データ保存）に関する関数 ---

// 保存
function saveTodo(todoObj) {
    let todos = localStorage.getItem('todos') ? JSON.parse(localStorage.getItem('todos')) : [];
    todos.push(todoObj);
    localStorage.setItem('todos', JSON.stringify(todos));
}

// 読み込み
function loadTodos() {
    filterTodos('all');
}

// 状態（チェックの有無）の更新
function updateTodoStatus(taskId, isCompleted) {
    let todos = localStorage.getItem('todos') ? JSON.parse(localStorage.getItem('todos')) : [];
    todos = todos.map(todo => {

        if (Number(todo.id) === Number(taskId)) {
            todo.isCompleted = isCompleted;
        }

        return todo;
    });

    localStorage.setItem('todos', JSON.stringify(todos));

    console.log('タスク完了状態を更新:', taskId, isCompleted);

    window.electronAPI.notifyTodoChanged();

}

// 削除
function deleteTodo(taskId) {
    let todos = localStorage.getItem('todos') ? JSON.parse(localStorage.getItem('todos')) : [];
    todos = todos.filter(todo => todo.id !== taskId);
    localStorage.setItem('todos', JSON.stringify(todos));

    window.electronAPI.notifyTodoChanged();

}

//全削除ボタン
const clearCompletedBtn = document.getElementById('clear-completed-btn');

if (clearCompletedBtn) {
    clearCompletedBtn.onclick = clearCompletedTodos;
}

// メニュー切り替え機能
const menuAll = document.getElementById('menuAll');
const menuActive = document.getElementById('menuActive');
const menuCompleted = document.getElementById('menuCompleted');

//　メニューのアクティブの見た目を変える共通関数
function changeActiveMenu(selectedMenu){
    [menuAll,menuActive,menuCompleted].forEach(menu => {
        if (menu) menu.classList.remove('active');
    });
    if (selectedMenu) selectedMenu.classList.add('active');
}

// 画面を一度空っぽにして条件に合うタスクだけを再表示する関数
function filterTodos(filterType){
    currentFilter = filterType;

    todoList.innerHTML = '';
    const todos = localStorage.getItem('todos') ? JSON.parse(localStorage.getItem('todos')) : [];
    const clearBtn = document.getElementById('clear-completed-btn');

    // Activeクラスのみ期限が近い順に並び替える処理
    if (filterType === 'active'){
        todos.sort((a,b) => {
            const dateA = a.date || '期限なし';
            const dateB = b.date || '期限なし';

            if(dateA === '期限なし' && dateB === '期限なし') return 0;
            if(dateA === '期限なし') return 1;
            if(dateB === '期限なし') return -1;

            return dateA.localeCompare(dateB);
        });
    }

    todos.forEach(todoObj => {
        if (filterType === 'all'){
            createTodoElement(todoObj);
        } else if (filterType === 'active' && !todoObj.isCompleted){
            createTodoElement(todoObj);
        } else if (filterType === 'completed' && todoObj.isCompleted){
            createTodoElement(todoObj);
        }
    });

    if(clearBtn){
        clearBtn.style.display = filterType === 'completed' ? 'block' : 'none';
    }
}

//　各メニューをクリックしたときのイベント
if (menuAll){
    menuAll.addEventListener('click',() => {
        changeActiveMenu(menuAll);
        filterTodos('all');
    });
}

if (menuActive){
    menuActive.addEventListener('click',() => {
        changeActiveMenu(menuActive);
        filterTodos('active');
    });
}

if (menuCompleted){
    menuCompleted.addEventListener('click',() =>{
        changeActiveMenu(menuCompleted);
        filterTodos('completed');
    });
}

function clearCompletedTodos(){
    if(!confirm('完了したタスクを全て削除する？'))return;
    let todos = localStorage.getItem('todos')?JSON.parse(localStorage.getItem('todos')):[];
    todos =todos.filter(todo => !todo.isCompleted);
    localStorage.setItem('todos',JSON.stringify(todos));
    filterTodos(currentFilter);
}

function saveAllTodos(){

    // 現在保存されている全タスクを取得
    let todos = localStorage.getItem('todos')
        ? JSON.parse(localStorage.getItem('todos'))
        : [];

    const liElements = todoList.querySelectorAll('li');

    liElements.forEach(li => {

        const taskId = li.dataset.id;

        const textSpan = li.querySelector('.task-content span');
        const checkbox = li.querySelector('input[type="checkbox"]');
        const timeSpan = li.querySelector('.task-time');
        const dateSpan = li.querySelector('.todo-date');

        if(!textSpan || !taskId) {
            return;
        }

        const endDate = dateSpan
            ? (dateSpan.dataset.endDate || '期限なし')
            : '期限なし';
        const startDate = dateSpan
            ? (dateSpan.dataset.startDate || null)
            : null;

        // 既存タスクをIDで探す
        const todo = todos.find(todo =>
            Number(todo.id) === Number(taskId)
        );

        if (todo) {

            todo.text = textSpan.textContent;
            todo.isCompleted = checkbox
                ? checkbox.checked
                : false;
            todo.time = timeSpan
                ? timeSpan.textContent
                : '';
            todo.date = endDate;
            todo.startDate = startDate || null;

        }
    });

    // 全タスクを保存
    localStorage.setItem('todos',JSON.stringify(todos));

    console.log('編集内容を保存しました');

    // ウィジェットへ通知
    window.electronAPI.notifyTodoChanged();

}
