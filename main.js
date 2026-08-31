const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { resolve } = require('dns');

let mainWindow;
let widgetWindow;

// Todo本体のウィンドウ

function createMainWindow() {

    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,

        show: false,

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
        width: 250,
        height: 250,

        resizable: false,

        frame: false,
        alwaysOnTop: false,
        skipTaskbar: true,
        transparent: true,

        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });

    widgetWindow.setAlwaysOnTop(false);

    // 保存されている位置を取得
    const savePosition = getWidgetPosition();

    if (savePosition) {
        widgetWindow.setPosition(
            savePosition.x,
            savePosition.y
        );
    }
    
   widgetWindow.loadFile('widget.html');

   // ウィジェットを移動した時
    widgetWindow.on('move', () => {

        if (!widgetWindow) {
            return;
        }

        const [x, y] = widgetWindow.getPosition();
        saveWidgetPosition(x, y);
    });

    //　ウィジェットを閉じた時
    widgetWindow.on('closed', () => {
        widgetWindow = null;
    });
}

// Electron起動時
app.whenReady().then(async () => {

    // Mac起動時にElectronを自動起動
    if (process.platform === 'darwin' || process.platform === 'win32') {

        app.setLoginItemSettings({
            openAtLogin: true,
            openAsHidden: false
        });

        console.log('自動起動設定:', app.getLoginItemSettings());

    }
    // 本体を裏で起動
    createMainWindow();

    // 本体の読み込みが完了するまで待つ
    await new Promise(resolve => {

        mainWindow.webContents.once(
            'did-finish-load',
            resolve
        );

    });

    // Mac起動時はウィジェットのみ表示
    createWidgetWindow();

});

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

    // 本体側の関数を実行してタスクを完了にする
    await mainWindow.webContents.executeJavaScript(`
        updateTodoStatus(${JSON.stringify(taskId)}, true);
        filterTodos('all');
    `);

    // ウィジェットを更新
    if (widgetWindow) {
        widgetWindow.webContents.send('todo-changed');
    }

    return true;
});

// 本体のタスク変更をウィジェットへ通知
ipcMain.on('todo-changed', () => {

    console.log('main.js: todo-changedを受信');

    if (widgetWindow) {

        console.log('main.js: ウィジェットへ通知');

        widgetWindow.webContents.send('todo-changed');

    } else {

        console.log('main.js: widgetWindowがありません');
    }
});

// 本体アプリを表示
ipcMain.on('open-main-window', () => {

    // 本体が存在しない場合は新しく作る
    if (!mainWindow) {
        createMainWindow();

        mainWindow.once('ready-to-show', () => {
            mainWindow.show();
            mainWindow.focus();

        });

        return;
    }

    // 本体が最小化されていた場合
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

// ウィジェットサイズの取得
ipcMain.handle('get-widget-size', () => {

    if (widgetWindow) {

        const [width, height] = widgetWindow.getSize();

        return {
            width: width,
            height: height
        };
    }

    return {
        width: 250,
        height: 250
    };
});

// ウィジェットサイズの変更
ipcMain.on('resize-widget', (event, width, height) => {

    if (!widgetWindow) {
        return;
    }

    // 最小サイズ
    const minWidth = 200;
    const minHeight = 150;

    // 最大サイズ
    const maxWidth = 600;
    const maxHeight = 600;

    width = Math.max(
        minWidth,
        Math.min(maxWidth, Math.round(width))
    );

    height = Math.max(
        minHeight,
        Math.min(maxHeight, Math.round(height))
    );

    widgetWindow.setSize(width, height);

});

// ウィジェット現在位置の取得
ipcMain.handle('get-widget-position' , () => {

    if (widgetWindow) {
        const [x, y] = widgetWindow.getPosition();

        return { x: x, y: y};
    }

    return { x: 0, y: 0};
});

// ウィジェット位置保存
function getPositionFile() {
    return path.join( app.getPath('userData'), 'widget-position.json' );
}

// 保存した位置を取得
function getWidgetPosition() {
    const filePath = getPositionFile();
    try {
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync( filePath, 'utf-8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error(
            'ウィジェット位置の読み込みに失敗:',
            error
        );
    }
    return null;
}

// ウィジェット位置を保存
function saveWidgetPosition(x, y) {
    const position = { x: x, y: y };

    try {
        fs.writeFileSync(
            getPositionFile(),
            JSON.stringify(position)
        );

        console.log('ウィジェット位置を保存:', position);

    } catch (error) {
        console.error(
            'ウィジェット位置の保存に失敗:',
            error
        );
    }
}