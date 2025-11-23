
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

### 用户使用指南

#### 1. 应用启动
- 安装对应平台的安装包（Windows .exe / macOS .dmg / Linux .AppImage）
- 启动应用后会看到主界面：

```
┌─────────────────────────────────────────────────────────────────┐
│  🌍 Polyglot Master                            Load Example  ⚙️  │
│  Cross-platform i18n Manager                         Powered by Gemini │
└─────────────────────────────────────────────────────────────────┘

┌───────────────── Import Data ────────────────── Export Data ──────────────────┐
│                                                         │                         │
│  📊 Import Excel       📁 Import Sources          │  💾 Download ZIP   │
│   .xlsx templates      xml, strings, arb           │  Export all files  │
│                                                         │                         │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### 2. 导入Excel数据
**方法一：拖拽导入**
- 直接将 `.xlsx` 文件拖拽到 "Import Excel" 区域

**方法二：点击导入**
- 点击 "Import Excel" 按钮
- 选择 Excel 文件（支持 `.xlsx`, `.xls` 格式）
- 文件会自动解析并显示在表格中

**Excel文件格式示例：**
```
| Key         | en-US      | zh-CN      | ja-JP      |
|-------------|------------|------------|------------|
| app_name    | My App     | 我的应用    | 私のアプリ   |
| welcome     | Welcome    | 欢迎       | よこそ      |
| good_morning| Good morning| 早上好     | おはよう     |
| save        | Save       | 保存        | 保存         |
```

#### 3. 导入源文件
点击 "Import Sources" 按钮，支持以下格式：

**Android XML:**
```xml
<resources>
    <string name="app_name">My App</string>
    <string name="welcome">Welcome</string>
</resources>
```

**iOS Strings:**
```
"app_name" = "My App";
"welcome" = "Welcome";
```

**Flutter ARB:**
```json
{
  "app_name": "My App",
  "welcome": "Welcome"
}
```

#### 4. 管理翻译数据

**编辑翻译：**
- 直接在表格单元格中点击编辑
- 支持多行文本和特殊字符
- 修改内容会自动保存

**AI翻译：**
- 点击 "🪙 Translate" 按钮
- 选择要翻译的语言列
- 使用 Google Gemini API 自动翻译缺失内容

**添加新语言：**
- 点击 "+" 按钮添加新语言列
- 设置语言代码和平台文件名

#### 5. 导出资源文件

**导出ZIP压缩包：**
- 点击 "💾 Download ZIP" 按钮
- 自动生成包含所有平台文件的ZIP包
- ZIP结构：
```
i18n_resources.zip
├── android/
│   └── values-zh-rCN/
│       └── strings.xml
├── ios/
│   └── zh-Hans.lproj/
│       └── Localizable.strings
└── flutter/
    └── lib/l10n/
        └── app_zh.arb
```

**导出Excel文件：**
- 点击 "📊 Download Excel" 按钮
- 生成包含所有翻译数据的Excel文件
- 可用于团队协作和备份

#### 6. 项目管理（桌面应用特有）

**保存项目：**
- 使用菜单 `文件 > 保存项目` 或按 `Ctrl/Cmd + S`
- 项目保存为 `polyglot_project.json` 文件
- 包含完整的翻译数据和配置信息

**打开项目：**
- 使用菜单 `文件 > 打开项目` 或按 `Ctrl/Cmd + O`
- 选择之前保存的项目文件
- 恢复完整的工作状态

### 快捷键指南

| 功能 | Windows | macOS | 说明 |
|------|---------|-------|------|
| 打开项目 | `Ctrl + O` | `Cmd + O` | 打开JSON项目文件 |
| 保存项目 | `Ctrl + S` | `Cmd + S` | 保存当前项目 |
| 退出应用 | `Alt + F4` | `Cmd + Q` | 关闭应用 |
| 开发者工具 | `F12` | `F12` | 开发模式专用 |
| 复制 | `Ctrl + C` | `Cmd + C` | 复制选中文本 |
| 粘贴 | `Ctrl + V` | `Cmd + V` | 粘贴文本 |

### 常见工作流程

#### 流程一：从Excel开始
1. 准备包含翻译内容的Excel文件
2. 启动应用并导入Excel文件
3. 检查数据完整性
4. 使用AI翻译填充缺失内容
5. 导出多平台资源文件

#### 流程二：从现有项目开始
1. 启动应用
2. 导入现有的源文件（Android/iOS/Flutter）
3. 添加新语言支持
4. 翻译和完善内容
5. 导出完整的资源文件

#### 流程三：团队协作
1. 导入Excel模板开始翻译工作
2. 完成所有语言的翻译
3. 导出Excel文件分享给团队
4. 收集反馈并更新内容
5. 最终导出平台特定的资源文件

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