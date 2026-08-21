const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI',{

    // 今日のタスクを取得
    getTodayTodos: () => {
        return ipcRenderer.invoke('get-today-todos');
    },

    // タスクを完了にする
    completeTodo: (taskId) => {
        return ipcRenderer.invoke('complete-todo', taskId);
    },

    // 本体アプリを表示
    openMainWindow: () => {
        ipcRenderer.send('open-main-window');
    }
});