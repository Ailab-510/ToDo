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
app.whenReady().then(() => {

    createMainWindow();
    createWidgetWindow();

});

// ウィジェットからの返信
// 今日のタスクを取得
ipcMain.handle('get-today-todos', () => {
    const todos = getTodos();
    const today = getTodayDate();

    return todos.filter(todo => {
        return todo.date === today && !todo.isCompleted;
    });
});

//　タスクを完了する
ipcMain.handle('complete-todo', (event, taskTask) => {
    let todos =getTodos();
    todos = todos.map(todo => {
        if (todo.text === taskText) {
            todo.isCompleted = true;
        }
        return todo;
    });
    saveTodos(todos);
    return true;
});

// 本体アプリを表示
ipcMain.on('open-main-window', () => {
    if (mainWindow) {
        mainWindow.show();
        mainWindow.focus();
    }
});

// LocalStrageではなくElectron
function getTodos() {
    return [];
}

function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}