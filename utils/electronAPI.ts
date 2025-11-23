/**
 * Electron API 工具类
 * 提供统一的文件系统操作接口，支持浏览器和Electron环境
 */

export interface FileSelectOptions {
  filters?: { name: string; extensions: string[] }[];
  title?: string;
}

export interface MessageBoxOptions {
  type?: 'none' | 'info' | 'error' | 'question' | 'warning';
  title?: string;
  message: string;
  detail?: string;
  buttons?: string[];
  defaultId?: number;
  cancelId?: number;
}

export interface FileDialogResult {
  canceled: boolean;
  filePaths?: string[];
  filePath?: string;
}

class ElectronAPI {
  private isElectron(): boolean {
    return typeof window !== 'undefined' && window.electronAPI !== undefined;
  }

  /**
   * 选择单个文件
   */
  async selectFile(options: FileSelectOptions = {}): Promise<FileDialogResult> {
    if (this.isElectron()) {
      return await window.electronAPI.selectFile(options);
    }

    // Web环境下的文件选择
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = options.filters?.map(f =>
        f.extensions.map(ext => `.${ext}`).join(',')
      ).join(',') || '*/*';

      input.onchange = (e) => {
        const files = (e.target as HTMLInputElement).files;
        if (files && files.length > 0) {
          resolve({
            canceled: false,
            filePaths: Array.from(files).map(f => f.name)
          });
        } else {
          resolve({ canceled: true });
        }
      };

      input.click();
    });
  }

  /**
   * 选择多个文件
   */
  async selectFiles(options: FileSelectOptions = {}): Promise<FileDialogResult> {
    if (this.isElectron()) {
      const result = await window.electronAPI.selectFile(options);
      return result;
    }

    // Web环境下的多文件选择
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = true;
      input.accept = options.filters?.map(f =>
        f.extensions.map(ext => `.${ext}`).join(',')
      ).join(',') || '*/*';

      input.onchange = (e) => {
        const files = (e.target as HTMLInputElement).files;
        if (files && files.length > 0) {
          resolve({
            canceled: false,
            filePaths: Array.from(files).map(f => f.name)
          });
        } else {
          resolve({ canceled: true });
        }
      };

      input.click();
    });
  }

  /**
   * 选择目录
   */
  async selectDirectory(options: { title?: string } = {}): Promise<FileDialogResult> {
    if (this.isElectron()) {
      return await window.electronAPI.selectDirectory(options);
    }

    // Web环境下不支持目录选择，返回空结果
    return { canceled: true };
  }

  /**
   * 保存文件对话框
   */
  async saveFile(
    defaultPath?: string,
    filters?: { name: string; extensions: string[] }[]
  ): Promise<FileDialogResult> {
    if (this.isElectron()) {
      return await window.electronAPI.saveFile(defaultPath, filters);
    }

    // Web环境下的文件下载
    return { canceled: true, filePath: defaultPath };
  }

  /**
   * 读取文件内容
   */
  async readFile(filePath: string): Promise<{ success: boolean; data?: string; error?: string }> {
    if (this.isElectron()) {
      return await window.electronAPI.readFile(filePath);
    }

    try {
      // Web环境下通过fetch读取文件
      const response = await fetch(filePath);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.text();
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * 写入文件内容
   */
  async writeFile(
    filePath: string,
    data: string
  ): Promise<{ success: boolean; error?: string }> {
    if (this.isElectron()) {
      return await window.electronAPI.writeFile(filePath, data);
    }

    // Web环境下不支持直接写入文件
    return {
      success: false,
      error: 'File writing is not supported in web environment'
    };
  }

  /**
   * 检查文件是否存在
   */
  async fileExists(filePath: string): Promise<boolean> {
    if (this.isElectron()) {
      return await window.electronAPI.fileExists(filePath);
    }

    try {
      // Web环境下通过HEAD请求检查文件是否存在
      const response = await fetch(filePath, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * 显示消息框
   */
  async showMessageBox(options: MessageBoxOptions): Promise<{ response: number; checkboxChecked?: boolean }> {
    if (this.isElectron()) {
      return await window.electronAPI.showMessageBox(options);
    }

    // Web环境下使用原生confirm或alert
    if (options.buttons && options.buttons.length > 1) {
      const result = confirm(options.message);
      return { response: result ? 1 : 0 };
    } else {
      alert(options.message);
      return { response: 0 };
    }
  }

  /**
   * 显示错误消息
   */
  async showError(title: string, content: string): Promise<void> {
    if (this.isElectron()) {
      await window.electronAPI.showError(title, content);
    } else {
      alert(`${title}\n\n${content}`);
    }
  }

  /**
   * 监听菜单动作
   */
  onMenuAction(callback: (action: string) => void): void {
    if (this.isElectron()) {
      window.electronAPI.onMenuAction(callback);
    }
  }

  /**
   * 移除监听器
   */
  removeAllListeners(channel: string): void {
    if (this.isElectron()) {
      window.electronAPI.removeAllListeners(channel);
    }
  }
}

// 导出单例实例
export const electronAPI = new ElectronAPI();

// 常用文件过滤器
export const FileFilters = {
  excel: { name: 'Excel Files', extensions: ['xlsx', 'xls'] },
  xml: { name: 'XML Files', extensions: ['xml'] },
  strings: { name: 'iOS Strings', extensions: ['strings'] },
  arb: { name: 'Flutter ARB', extensions: ['arb'] },
  json: { name: 'JSON Files', extensions: ['json'] },
  all: { name: 'All Files', extensions: ['*'] }
};

// 常用过滤器组合
export const CommonFilters = {
  importSources: [FileFilters.xml, FileFilters.strings, FileFilters.arb],
  exportData: [FileFilters.excel],
  allFiles: [FileFilters.all]
};