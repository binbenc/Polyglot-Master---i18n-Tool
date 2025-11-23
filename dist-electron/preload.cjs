"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
// 暴露安全的 API 给渲染进程
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    // 文件操作
    selectFile: (options) => electron_1.ipcRenderer.invoke('select-file', options),
    selectDirectory: (options) => electron_1.ipcRenderer.invoke('select-directory', options),
    saveFile: (defaultPath, filters) => electron_1.ipcRenderer.invoke('save-file', defaultPath, filters),
    readFile: (filePath) => electron_1.ipcRenderer.invoke('read-file', filePath),
    writeFile: (filePath, data) => electron_1.ipcRenderer.invoke('write-file', filePath, data),
    fileExists: (filePath) => electron_1.ipcRenderer.invoke('file-exists', filePath),
    // 消息框
    showMessageBox: (options) => electron_1.ipcRenderer.invoke('show-message-box', options),
    showError: (title, content) => electron_1.ipcRenderer.invoke('show-error', title, content),
    // 菜单事件监听
    onMenuAction: (callback) => {
        const menuActions = [
            'menu-open-project',
            'menu-save-project',
            'menu-import-excel',
            'menu-export-excel'
        ];
        menuActions.forEach(action => {
            electron_1.ipcRenderer.on(action, () => callback(action));
        });
    },
    // 移除监听器
    removeAllListeners: (channel) => {
        electron_1.ipcRenderer.removeAllListeners(channel);
    }
});
