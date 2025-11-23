import { app, BrowserWindow, Menu, ipcMain, dialog, shell } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

// 保持对窗口对象的全局引用
let mainWindow: BrowserWindow | null = null;

// 开发环境检测
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

function createWindow(): void {
  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs')
    },
    titleBarStyle: 'default',
    show: false, // 先不显示，等加载完成后再显示
    icon: path.join(__dirname, '../assets/icon.png') // 应用图标
  });

  // 加载应用
  if (isDev) {
    mainWindow.loadURL('http://localhost:3001');
    // 开发环境下打开开发者工具
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // 窗口准备好后显示
  mainWindow.once('ready-to-show', () => {
    if (mainWindow) {
      mainWindow.show();

      // 开发环境下聚焦到窗口
      if (isDev) {
        mainWindow.focus();
      }
    }
  });

  // 当窗口关闭时触发
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // 处理外部链接
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

// 创建应用菜单
function createMenu(): void {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: '文件',
      submenu: [
        {
          label: '打开项目',
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            // 触发打开项目文件对话框
            if (mainWindow) {
              mainWindow.webContents.send('menu-open-project');
            }
          }
        },
        {
          label: '保存项目',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('menu-save-project');
            }
          }
        },
        { type: 'separator' },
        {
          label: '导入 Excel',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('menu-import-excel');
            }
          }
        },
        {
          label: '导出 Excel',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('menu-export-excel');
            }
          }
        },
        { type: 'separator' },
        {
          label: '退出',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: '编辑',
      submenu: [
        { role: 'undo', label: '撤销' },
        { role: 'redo', label: '重做' },
        { type: 'separator' },
        { role: 'cut', label: '剪切' },
        { role: 'copy', label: '复制' },
        { role: 'paste', label: '粘贴' },
        { role: 'selectAll', label: '全选' }
      ]
    },
    {
      label: '视图',
      submenu: [
        { role: 'reload', label: '重新加载' },
        { role: 'forceReload', label: '强制重新加载' },
        { role: 'toggleDevTools', label: '开发者工具' },
        { type: 'separator' },
        { role: 'resetZoom', label: '实际大小' },
        { role: 'zoomIn', label: '放大' },
        { role: 'zoomOut', label: '缩小' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: '全屏' }
      ]
    },
    {
      label: '窗口',
      submenu: [
        { role: 'minimize', label: '最小化' },
        { role: 'close', label: '关闭' }
      ]
    },
    {
      label: '帮助',
      submenu: [
        {
          label: '关于',
          click: () => {
            dialog.showMessageBox(mainWindow!, {
              type: 'info',
              title: '关于 Polyglot Master',
              message: 'Polyglot Master',
              detail: '跨平台国际化资源管理工具\n\n一个强大的多语言翻译管理工具，支持 Android、iOS、Flutter 平台的本地化资源文件管理。',
              buttons: ['确定']
            });
          }
        }
      ]
    }
  ];

  // macOS 特殊菜单处理
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: 'about', label: '关于 Polyglot Master' },
        { type: 'separator' },
        { role: 'services', label: '服务' },
        { type: 'separator' },
        { role: 'hide', label: '隐藏 Polyglot Master' },
        { role: 'hideOthers', label: '隐藏其他' },
        { role: 'unhide', label: '显示全部' },
        { type: 'separator' },
        { role: 'quit', label: '退出 Polyglot Master' }
      ]
    });
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// IPC 处理程序
function setupIpcHandlers(): void {
  // 选择文件
  ipcMain.handle('select-file', async (event, options: { filters?: Electron.FileFilter[], title?: string } = {}) => {
    if (!mainWindow) return { canceled: true };

    const result = await dialog.showOpenDialog(mainWindow, {
      title: options.title || '选择文件',
      filters: options.filters || [
        { name: '所有文件', extensions: ['*'] }
      ],
      properties: ['openFile']
    });

    return result;
  });

  // 选择目录
  ipcMain.handle('select-directory', async (event, options: { title?: string } = {}) => {
    if (!mainWindow) return { canceled: true };

    const result = await dialog.showOpenDialog(mainWindow, {
      title: options.title || '选择目录',
      properties: ['openDirectory']
    });

    return result;
  });

  // 保存文件
  ipcMain.handle('save-file', async (event, defaultPath?: string, filters?: Electron.FileFilter[]) => {
    if (!mainWindow) return { canceled: true };

    const result = await dialog.showSaveDialog(mainWindow, {
      defaultPath,
      filters: filters || [
        { name: '所有文件', extensions: ['*'] }
      ]
    });

    return result;
  });

  // 读取文件
  ipcMain.handle('read-file', async (event, filePath: string) => {
    try {
      const data = await fs.promises.readFile(filePath, 'utf8');
      return { success: true, data };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // 写入文件
  ipcMain.handle('write-file', async (event, filePath: string, data: string) => {
    try {
      await fs.promises.writeFile(filePath, data, 'utf8');
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // 检查文件是否存在
  ipcMain.handle('file-exists', async (event, filePath: string) => {
    try {
      await fs.promises.access(filePath);
      return true;
    } catch {
      return false;
    }
  });

  // 显示消息框
  ipcMain.handle('show-message-box', async (event, options: Electron.MessageBoxOptions) => {
    if (!mainWindow) return { response: 0 };

    const result = await dialog.showMessageBox(mainWindow, options);
    return result;
  });

  // 显示错误消息
  ipcMain.handle('show-error', async (event, title: string, content: string) => {
    if (!mainWindow) return;

    await dialog.showErrorBox(title, content);
  });
}

// Electron 应用准备就绪时触发
app.whenReady().then(() => {
  createWindow();
  createMenu();
  setupIpcHandlers();

  app.on('activate', () => {
    // 在 macOS 上，当点击 dock 图标并且没有其他窗口打开时
    // 通常会重新创建一个窗口
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// 当所有窗口关闭时退出应用
app.on('window-all-closed', () => {
  // 在 macOS 上，应用和菜单栏通常会保持活跃状态
  // 直到用户明确使用 Cmd + Q 退出
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 安全设置
app.on('web-contents-created', (event, contents) => {
  contents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
});