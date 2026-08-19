const { app, BrowserWindow } = require('electron');
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