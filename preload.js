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

    // ウィジェットの現在位置を取得
    getWidgetPosition: () => {
        return ipcRenderer.invoke('get-widget-position');
    },

    // ウィジェットサイズの現在値を取得
    getWidgetSize: () => {
        return ipcRenderer.invoke('get-widget-size');
    },

    // ウィジェットのサイズを変更
    resizeWidget: (width, height) => {
        ipcRenderer.send('resize-widget', width, height);
    },

    // ウィジェットを閉じる
    closeWidget: () => {
        ipcRenderer.send('close-widget');
    },

    // 本体のタスク変更をウィジェットへ通知
    notifyTodoChanged: () => {

        console.log('preload: todo-changedを送信');

        ipcRenderer.send('todo-changed');
    },

    onTodoChanged: (callback) => {
        ipcRenderer.on('todo-changed', () => {
            callback();
        });
    }

});
