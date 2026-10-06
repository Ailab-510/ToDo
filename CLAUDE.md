# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# 開発（アプリを起動）
npm start

# Mac向けビルド（.dmg）
npm run build:mac

# Windows向けビルド（.exe / nsis）
npm run build:win
```

テストフレームワークは設定されていません。

## アーキテクチャ概要

Electronアプリで、2つのウィンドウから構成されます。

- **mainWindow** (`index.html` + `script.js`) — タスク管理の本体UI。閉じてもhideされるだけで終了しない。
- **widgetWindow** (`widget.html` + `widget.js`) — 常時デスクトップに表示する小型ウィジェット（フレームなし・透明）。ウィジェット位置は `userData/widget-position.json` に保存される。

### データの流れ

タスクデータは **mainWindowのlocalStorage** にのみ保存されます（`todos` キー）。widgetWindowはlocalStorageに直接アクセスできないため、mainProcessを経由して取得します。

```
widgetWindow
    ↕ IPC (electronAPI)
main.js (mainProcess)
    ↕ executeJavaScript() でlocalStorageを直接操作
mainWindow (renderer) ← localStorage
```

- **main.jsがtodosを読む方法**: `mainWindow.webContents.executeJavaScript()` でrendererのlocalStorageを実行時に読む（`getTodos()`関数）。
- **ウィジェットからタスクを完了する方法**: widgetがIPCで `complete-todo` を呼ぶ → main.jsがmainWindowの `updateTodoStatus()` と `filterTodos()` をexecuteJavaScriptで呼び出す → mainWindowのlocalStorageを更新 → widgetへ `todo-changed` イベントを送信。

### IPC通信の構造

`preload.js` の `contextBridge` で `window.electronAPI` を両ウィンドウに公開しています（同一のpreload.jsを共有）。

主なIPCチャンネル：

| チャンネル | 方向 | 役割 |
|---|---|---|
| `get-today-todos` | invoke | 今日の未完了タスクを取得 |
| `complete-todo` | invoke | widgetからタスクを完了 |
| `todo-changed` | send/on | タスク変更をwidgetへ通知 |
| `open-main-window` | send | widgetから本体を前面表示 |
| `resize-widget` | send | widgetのサイズ変更 |
| `close-widget` | send | widgetを閉じる |

### 起動時の動作

1. `app.whenReady()` → mainWindowを作成（非表示で起動）
2. mainWindowの読み込み完了を待機（`did-finish-load`）
3. widgetWindowを作成して表示
4. Mac/Windowsでログイン時の自動起動を設定（`setLoginItemSettings`）
5. `app.requestSingleInstanceLock()` で多重起動を防止
