// 画面の要素を取得
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const todoDate = document.getElementById('todo-date');

//　今どのメニューが開かれているかを覚えておくための変数
let currentFilter = 'all';

// 💡 1. ページ読み込み時に保存されたタスクを表示
window.addEventListener('DOMContentLoaded',loadTodos);

//　タスクを追加する処理の本体
function excuteAddTask(){
    const taskText = todoInput.value.trim();
    if(taskText === '')return;

    const deadline = todoDate.value ? todoDate.value : '期限なし';

    const now = new Date();
    const timeText = `${now.getMonth() + 1}/${now.getDate()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // 新しいタスクデータ（オブジェクト）を作る
    const newTodo = {
        text: taskText,
        isCompleted: false,
        time: timeText,
        date: deadline
    };

    createTodoElement(newTodo, 'all');
    saveTodo(newTodo);

    todoDate.blur();
    todoInput.value = ''; // 入力欄をクリア
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

    if(todoObj.isCompleted && currentFilter !== 'completed'){
        span.classList.add('completed');
    }

    const timeSpan = document.createElement('span');
    timeSpan.textContent = todoObj.time ? todoObj.time : '';
    timeSpan.classList.add('task-time');

    // 期限表示
    const dateSpan = document.createElement('span');
    dateSpan.textContent = `〆: ${todoObj.date || '期限なし'}`;
    dateSpan.classList.add('todo-date');

    // チェックボックスがクリックされたときの動き
    checkbox.addEventListener('change', () => {
        updateTodoStatus(todoObj.text, checkbox.checked);

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
            const inputField = document.createElement('input');
            inputField.type = 'text';
            inputField.value = span.textContent;
            inputField.classList.add('edit-input');
            span.replaceWith(inputField);

            const dateField = document.createElement('input');
            dateField.type = 'date';

            const currentFormatDate = dateSpan.textContent.replace('〆: ','');
            dateField.value = currentFormatDate !== '期限なし' ? currentFormatDate : '';
            dateField.classList.add('edit-date');
            dateSpan.replaceWith(dateField);

            editBtn.textContent = '保存';

        }else{
            const inputField = taskContent.querySelector('.edit-input');
            if(inputField){
                span.textContent = inputField.value;
                inputField.replaceWith(span);
            }

            const dateField = taskContent.querySelector('.edit-date');
            if(dateField){
                const newDeadline =dateField.value ? dateField.value : '期限なし';
                dateSpan.textContent = `〆: ${newDeadline}`;
                dateField.replaceWith(dateSpan);
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
        deleteTodo(todoObj.text);
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

function saveAllTodos(){
    const todos = [];
    const liElements = todoList.querySelectorAll('li');

    liElements.forEach(li => {
        const textSpan = li.querySelector('.task-content span');
        const checkbox = li.querySelector('input[type="checkbox"]');
        const timeSpan = li.querySelector('.task-time');
        const dateSpan = li.querySelector('.todo-date');

        if(textSpan){
            const dateText = dateSpan ? dateSpan.textContent.replace('〆: ','') : '期限なし';

            todos.push({
                text: textSpan.textContent,
                isCompleted: checkbox ? checkbox.checked : false,
                time: timeSpan ? timeSpan.textContent : '',
                date: dateText
            });
        }
    });
    localStorage.setItem('todos',JSON.stringify(todos));
}