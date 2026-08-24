const { resolve } = require('dns');
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;
let widgetWindow;

// Todo本体のウィンドウ

function createMainWindow() {

    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,

        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });
    
    mainWindow.loadFile('index.html');

    //　本体を閉じた時
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// デスクトップウィジェット

function createWidgetWindow() {
    widgetWindow = new BrowserWindow({
        width: 300,
        height: 300,

        frame: false,
        alwaysOnTop: true,
        skipTaskbar: true,
        transparent: true,

        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });
    
   widgetWindow.loadFile('widget.html');

    //　ウィジェットを閉じた時
    widgetWindow.on('closed', () => {
        widgetWindow = null;
    });
}

// Electron起動時
app.whenReady().then(async () => {

    createMainWindow();

    await new Promise(resolve => {
        mainWindow.webContents.once('did-finish-load', resolve);
    });

    createWidgetWindow();

});

// ウィジェットからの返信
// 今日のタスクを取得
ipcMain.handle('get-today-todos', async () => {

    const todos = await getTodos();
    const today = getTodayDate();

    console.log('今日の日付:', today);
    console.log('取得したタスク:',todos);

    const todayTodos = todos.filter(todo => {
        return todo.date === today && !todo.isCompleted;
    });

    console.log('今日のタスク:', todayTodos);

    return todayTodos;
});

//　タスクを完了する
ipcMain.handle('complete-todo', async (event, taskId) => {

        if (!mainWindow) {
            return false;
        }

        const todos = await getTodos();

        const updateTodos = todos.map(todo => {

            if (todo.id === taskId){
                todo.isCompleted = true;
            }

            return todo;
        });

        const json = JSON.stringify(updateTodos);

        await mainWindow.webContents.executeJavaScript(`localStorage.setItem('todos', ${JSON.stringify(json)});`);

    return true;
});

// 本体アプリを表示
ipcMain.on('open-main-window', () => {

    // 本体が存在しない場合は新しく作る
    if (!mainWindow) {
        createMainWindow();
        return;
    }

    // 本体が存在する場合
    if (mainWindow.isMinimized()){
        mainWindow.restore();
    }

    mainWindow.show();
    mainWindow.focus();

});

// LocalStorageからタスクを取得
async function getTodos() {

    if(!mainWindow) {
        return [];
    }

    const todos = await mainWindow.webContents.executeJavaScript(`JSON.parse(localStorage.getItem('todos') || '[]')`);

    return todos;
}

// 今日の日付を取得
function getTodayDate() {

    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}