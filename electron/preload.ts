import { contextBridge, ipcRenderer } from 'electron';

// 暴露安全的 API 给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 文件操作
  selectFile: (options?: { filters?: { name: string, extensions: string[] }[], title?: string }) =>
    ipcRenderer.invoke('select-file', options),

  selectDirectory: (options?: { title?: string }) =>
    ipcRenderer.invoke('select-directory', options),

  saveFile: (defaultPath?: string, filters?: { name: string, extensions: string[] }[]) =>
    ipcRenderer.invoke('save-file', defaultPath, filters),

  readFile: (filePath: string) =>
    ipcRenderer.invoke('read-file', filePath),

  writeFile: (filePath: string, data: string) =>
    ipcRenderer.invoke('write-file', filePath, data),

  fileExists: (filePath: string) =>
    ipcRenderer.invoke('file-exists', filePath),

  // 消息框
  showMessageBox: (options: {
    type?: 'none' | 'info' | 'error' | 'question' | 'warning',
    title?: string,
    message: string,
    detail?: string,
    buttons?: string[],
    defaultId?: number,
    cancelId?: number
  }) => ipcRenderer.invoke('show-message-box', options),

  showError: (title: string, content: string) =>
    ipcRenderer.invoke('show-error', title, content),

  // 菜单事件监听
  onMenuAction: (callback: (action: string) => void) => {
    const menuActions = [
      'menu-open-project',
      'menu-save-project',
      'menu-import-excel',
      'menu-export-excel'
    ];

    menuActions.forEach(action => {
      ipcRenderer.on(action, () => callback(action));
    });
  },

  // 移除监听器
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel);
  }
});

// 类型定义
declare global {
  interface Window {
    electronAPI: {
      selectFile: (options?: { filters?: { name: string, extensions: string[] }[], title?: string }) => Promise<{ canceled: boolean, filePaths?: string[] }>;
      selectDirectory: (options?: { title?: string }) => Promise<{ canceled: boolean, filePaths?: string[] }>;
      saveFile: (defaultPath?: string, filters?: { name: string, extensions: string[] }[]) => Promise<{ canceled: boolean, filePath?: string }>;
      readFile: (filePath: string) => Promise<{ success: boolean, data?: string, error?: string }>;
      writeFile: (filePath: string, data: string) => Promise<{ success: boolean, error?: string }>;
      fileExists: (filePath: string) => Promise<boolean>;
      showMessageBox: (options: {
        type?: 'none' | 'info' | 'error' | 'question' | 'warning',
        title?: string,
        message: string,
        detail?: string,
        buttons?: string[],
        defaultId?: number,
        cancelId?: number
      }) => Promise<{ response: number, checkboxChecked?: boolean }>;
      showError: (title: string, content: string) => Promise<void>;
      onMenuAction: (callback: (action: string) => void) => void;
      removeAllListeners: (channel: string) => void;
    };
  }
}