
# Polyglot Master - Electron 桌面应用转换指南

## 🎯 项目概述

成功将 Polyglot Master React Web 应用转换为跨平台桌面应用，支持 Windows、macOS 和 Linux。

## ✅ 完成的功能

### 1. Electron 框架集成
- ✅ 安装并配置 Electron 相关依赖
- ✅ 创建 Electron 主进程 (`electron/main.ts`)
- ✅ 创建预加载脚本 (`electron/preload.ts`)
- ✅ 配置安全的 IPC 通信

### 2. 开发环境配置
- ✅ 配置 Vite 构建 Electron 应用
- ✅ 设置开发模式热重载
- ✅ TypeScript 编译配置
- ✅ 端口动态适配

### 3. 桌面应用功能
- ✅ 原生窗口管理 (1200x800，最小尺寸 800x600)
- ✅ 完整的应用菜单系统
- ✅ 文件系统集成 (选择、读取、写入文件)
- ✅ 桌面文件对话框
- ✅ 安全设置 (外部链接处理)

### 4. React 应用增强
- ✅ Electron API 工具类 (`utils/electronAPI.ts`)
- ✅ 环境检测和条件渲染
- ✅ 菜单快捷键支持
- ✅ 项目文件保存/打开功能
- ✅ 原生文件选择器集成

### 5. 多平台打包配置
- ✅ Windows (.exe 安装包)
- ✅ macOS (.dmg 镜像文件)
- ✅ Linux (.AppImage 便携版)
- ✅ 自动应用图标生成

## 🚀 运行命令

### 开发模式
```bash
# Web 应用开发模式
npm run dev

# Electron 桌面应用开发模式
npm run electron:dev
```

### 构建打包
```bash
# 构建 Web 应用
npm run build:web

# 构建 Electron 应用（所有平台）
npm run electron:build

# 构建特定平台
npm run electron:build:win    # Windows
npm run electron:build:mac    # macOS
npm run electron:build:linux  # Linux
```

## 📁 项目结构

```
polyglot-master/
├── electron/
│   ├── main.ts          # Electron 主进程
│   └── preload.ts       # 预加载脚本
├── scripts/
│   └── build-electron.cjs  # Electron 构建脚本
├── utils/
│   └── electronAPI.ts   # Electron API 工具类
├── assets/              # 应用图标资源
├── dist/                # Web 应用构建输出
├── dist-electron/       # Electron 主进程构建输出
└── release/             # 最终打包文件输出
```

## 🎨 桌面应用特性

### 菜单系统
- **文件菜单**: 打开项目、保存项目、导入/导出 Excel、退出
- **编辑菜单**: 撤销、重做、剪切、复制、粘贴、全选
- **视图菜单**: 重新加载、开发者工具、缩放控制、全屏
- **窗口菜单**: 最小化、关闭
- **帮助菜单**: 关于信息

### 快捷键
- `Ctrl/Cmd + O`: 打开项目文件
- `Ctrl/Cmd + S`: 保存项目文件
- `Ctrl/Cmd + Q`: 退出应用
- `F12`: 开发者工具 (仅开发模式)

### 文件操作
- **打开项目**: 通过系统文件选择器打开 `.json` 项目文件
- **保存项目**: 将当前项目保存为 JSON 文件
- **导入 Excel**: 使用系统文件选择器导入 Excel 文件
- **导出功能**: 生成 ZIP 压缩包或 Excel 文件

## 🔧 技术实现

### IPC 通信
- **安全的上下文隔离**: 使用 `contextIsolation` 和 `preload.js`
- **类型安全的 API**: TypeScript 接口定义
- **错误处理**: 完整的异常捕获和用户提示

### 环境适配
- **开发环境**: 自动检测并加载 `localhost:3001`
- **生产环境**: 加载本地 HTML 文件
- **跨平台兼容**: 统一的路径处理和 API 调用

### 构建优化
- **模块解析**: CommonJS 兼容性处理
- **资源打包**: 自动包含必要文件和依赖
- **图标生成**: 统一的应用图标格式

## 🎯 使用说明

### 开发者
1. 克隆项目并安装依赖：`npm install`
2. 启动开发模式：`npm run electron:dev`
3. 修改代码后自动热重载

### 用户
1. 下载对应平台的安装包
2. 安装并启动应用
3. 使用菜单或界面按钮进行文件操作
4. 保存项目以供后续使用

## 🔜 未来扩展

- [ ] 系统托盘集成
- [ ] 自动更新功能
- [ ] 应用商店发布
- [ ] 多语言界面
- [ ] 插件系统支持
- [ ] 云同步功能

## 🐛 故障排除

### 常见问题
1. **端口冲突**: Vite 会自动选择可用端口
2. **构建失败**: 确保安装了所有依赖和正确配置
3. **文件访问**: 检查文件权限和路径格式
4. **打包错误**: 清理 `dist` 目录后重新构建

### 调试技巧
- 开发模式下按 `F12` 打开开发者工具
- 查看 `npm run electron:dev` 的控制台输出
- 检查 `release` 目录中的打包日志

---

**恭喜！** 🎉 Polyglot Master 已成功转换为功能完整的跨平台桌面应用！