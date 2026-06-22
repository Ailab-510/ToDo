// 画面の要素を取得
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');

//　今どのメニューが開かれているかを覚えておくための変数
let currentFilter = 'all';

// 💡 1. ページ読み込み時に保存されたタスクを表示
window.addEventListener('DOMContentLoaded', loadTodos);

todoInput.addEventListener('DOMContentloaded',loadTodos);

todoInput.addEventListener('keydown',(event) =>{
    if(event.isComposing) return;
    if(event.key !== 'Enter') return;

    const taskText = todoInput.value.trim();
    if(taskText === '') return;

    event.preventDefault();

//　タスク追加時間の記録
    const now = new Date();
    const timeText = `${now.getMonth() + 1}/${now.getDate()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

// 新しいタスクデータ（オブジェクト）を作る
    const newTodo = {
        text: taskText,
        isCompleted: false,
        time: timeText
    };

    createTodoElement(newTodo,'all');
    saveTodo(newTodo);

    todoInput.value = ''; // 入力欄をクリア
});

// 💡 3. タスクを画面に作る関数
function createTodoElement(todoObj, filterType = 'all') {
    const li = document.createElement('li');

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

    const timeSpan = document.createElement('span');
    timeSpan.textContent = todoObj.time ? todoObj.time : '';
    timeSpan.classList.add('task-time');

    // 完了したタスクであってもCompletedタブにいるときは打ち消し線をつけない
    if (todoObj.isCompleted && currentFilter !== 'completed') {
        span.classList.add('completed');
    } else {
        span.classList.remove('completed');
    }

    // チェックボックスがクリックされたときの動き
    checkbox.addEventListener('change', () => {
        updateTodoStatus(todoObj.text, checkbox.checked);

        if (checkbox.checked && currentFilter !== 'completed') {
            span.classList.add('completed');
        } else {
            span.classList.remove('completed');
        }

         setTimeout(() => {
            filterTodos(currentFilter);
        },200);    
    });

    // 削除ボタンを作る
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '削除';
    deleteBtn.classList.add('delete-btn');
    
    deleteBtn.addEventListener('click', () => {
        li.remove();
        deleteTodo(todoObj.text);
    });

    // 部品を組み立てる
    taskContent.appendChild(checkbox);
    taskContent.appendChild(span);
    taskContent.appendChild(timeSpan);
    li.appendChild(taskContent);
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
    let todos = localStorage.getItem('todos') ? JSON.parse(localStorage.getItem('todos')) : [];
    todos.forEach(todoObj => createTodoElement(todoObj,'all'));
}

// 状態（チェックの有無）の更新
function updateTodoStatus(taskText, isCompleted) {
    let todos = localStorage.getItem('todos') ? JSON.parse(localStorage.getItem('todos')) : [];
    todos = todos.map(todo => {
        if (todo.text === taskText) {
            todo.isCompleted = isCompleted;
        }
        return todo;
    });
    localStorage.setItem('todos', JSON.stringify(todos));
}

// 削除
function deleteTodo(taskText) {
    let todos = localStorage.getItem('todos') ? JSON.parse(localStorage.getItem('todos')) : [];
    todos = todos.filter(todo => todo.text !== taskText);
    localStorage.setItem('todos', JSON.stringify(todos));
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

    todos.forEach(todoObj => {
        if (filterType === 'all'){
            createTodoElement(todoObj);
        } else if (filterType === 'active' && !todoObj.isCompleted){
            createTodoElement(todoObj);
        } else if (filterType === 'completed' && todoObj.isCompleted){
            createTodoElement(todoObj,filterType);
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