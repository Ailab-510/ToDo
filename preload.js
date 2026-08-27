const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI',{

    // 今日のタスクを取得
    getTodayTodos: () => {
        return ipcRenderer.invoke('get-today-todos');
    },

    // タスクを完了する
    completeTodo: (taskId) => {
        return ipcRenderer.invoke('complete-todo', taskId);
    },

    // 本体アプリを表示
    openMainWindow: () => {
        ipcRenderer.send('open-main-window');
    },

    // ウィジェットを移動
    moveWidget: (x, y) => {
        ipcRenderer.send('move-widget', x, y);
    },

    // ウィジェットの現在位置を取得
    getWidgetPosition: () => {
        return ipcRenderer.invoke('get-widget-position');
    },

    // ウィジェット位置を保存
    saveWidgetPosition: (x, y) => {
        ipcRenderer.send('save-widget-position', x, y);
    },

    // ウィジェットサイズ
    // ウィジェットの現在のサイズを取得
    getWidgetSize: () => {
        return ipcRenderer.invoke('get-widget-size');
    },

    // ウィジェットのサイズを変更
    resizeWidget: (width, height) => {
        ipcRenderer.send('resize-widget', width, height);
    },

    // 本体のタスク変更をウィジェットへ通知
    notifyTodoChanged: () => {
        ipcRenderer.send('todo-changed');
    },

    onTodoChanged: (callback) => {
        ipcRenderer.on('todo-changed', () => {
            callback();
        });
    }

});