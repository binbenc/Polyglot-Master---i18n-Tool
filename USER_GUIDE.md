# Polyglot Master 用户可视化指南

## 📖 概述

本指南提供详细的截图和步骤说明，帮助用户快速掌握 Polyglot Master 桌面应用的使用方法。

## 🚀 快速开始

### 界面概览

```
┌─────────────────────────────────────────────────────────────────┐
│  🌍 Polyglot Master                            Load Example  🔄  📁  │
│  Cross-platform i18n Manager                         ⚙️ │
└─────────────────────────────────────────────────────────────────┘

[ 导入数据区域 ]───────────────────────── [ 导出数据区域 ]
  📊 Import Excel                               💾 Download ZIP
    .xlsx templates                                Export all files

  📁 Import Sources                            📊 Download Excel
    xml, strings, arb

[ 翻译数据表格区域 ]
┌──────────────────────────────────────────────────────────────────────┐
│  Key      │  en-US  │  zh-CN  │  ja-JP  │  Actions               │
│──────────────────────────────────────────────────────────────────────│
│ app_name │  My App │  我的应用│  私のアプリ │  [Translate] [Delete] │
│ welcome  │  Welcome│  欢迎   │  いらっしゃ   │  [Translate] [Delete] │
│ save     │  Save   │  保存    │  保存        │  [Translate] [Delete] │
│ …        │  …      │  …      │  …           │  [Translate] [Delete] │
└──────────────────────────────────────────────────────────────────────┘

[ 添加语言按钮: + 新增语言列 ]
```

## 📊 详细操作步骤

### 1. 导入Excel文件

#### 方法一：拖拽导入
```
┌───────────────── Import Data ──────────────────┐
│  📊 Import Excel           [拖拽Excel文件到这里] │
│   .xlsx templates                              │
│                                             │
│  📁 Import Sources                               │
│    xml, strings, arb                           │
└─────────────────────────────────────────────────┘
```

#### 方法二：点击选择
```
点击 "Import Excel" →
选择文件对话框 →
选择 .xlsx 文件 →
自动解析数据
```

### 2. Excel文件格式要求

**标准格式：**
```
| Key         | en-US      | zh-CN      | ja-JP      |
|-------------|------------|------------|------------|
| app_name    | My App     | 我的应用    | 私のアプリ   |
| welcome     | Welcome    | 欢迎       | いらっしゃ   |
| save        | Save       | 保存        | 保存         |
| settings    | Settings   | 设置        | 設定         |
```

**注意事项：**
- 第一列必须是 `Key`（翻译键）
- 后续列是语言代码（如：en-US, zh-CN, ja-JP）
- 支持无限数量的语言列
- 空单元格会被跳过

### 3. 导入源文件

点击 "Import Sources" 后会弹出模态框：

```
┌───────────────── Import Source Files ──────────────────┐
│                                                   │
│  平台选择:                                    │
│  ○ Android  🤖️                               │
│  ○ iOS      🍎                                   │
│  ○ Flutter  💚                                    │
│                                                   │
│  Base File (en-US):                            │
│  [浏览...] 选择主语言文件                        │
│                                                   │
│  Other Languages:                               │
│  + 添加行                                       │
│  [删除]    语言: [选择]  文件: [浏览...]     │
│  [删除]    语言: [选择]  文件: [浏览...]     │
│                                                   │
│        [Import]      [Cancel]                  │
└─────────────────────────────────────────────────┘
```

### 4. 编辑翻译内容

#### 直接编辑：
- 点击任意单元格即可编辑
- 支持多行文本
- 自动保存更改

#### 批量操作：
```
┌─ 操作列 ─────────────────────────────────────┐
│  Key  │  en-US  │  zh-CN  │  Actions     │
├──────┼────────┼────────┼─────────────┤
│ app  │  App    │  应用   │  [🤖️ Trans] │
│ name │         │         │  [🗑️ Delete] │
└──────┴────────┴────────┴─────────────┘
```

### 5. AI翻译功能

#### 单个翻译：
1. 点击对应行的 🪙 Translate 按钮
2. 选择目标语言
3. 自动翻译并填充

#### 批量翻译：
1. 点击顶部的全局翻译按钮
2. 选择要翻译的语言列
3. 一键翻译所有缺失内容

```
翻译配置：
┌───────────────── AI Translation ──────────────────┐
│                                                   │
│  选择源语言: en-US                              │
│                                                   │
│  选择目标语言:                                   │
│  ☑️ zh-CN  ☐ ja-JP  ☐ ko-KR                   │
│                                                   │
│  API密钥: [已配置]                               │
│                                                   │
│        [开始翻译]      [取消]                      │
└─────────────────────────────────────────────────┘
```

### 6. 添加新语言

```
添加新语言配置：
┌───────────────── Add Language ──────────────────┐
│                                                   │
│  语言代码:                                       │
│  [示例: fr-FR]                                    │
│                                                   │
│  显示名称:                                       │
│  [示例: French]                                  │
│                                                   │
│  文件配置:                                       │
│  Android:  strings.xml   values-fr/             │
│  iOS:      Localizable.strings   fr.lproj/        │
│  Flutter:  app_fr.arb        lib/l10n/            │
│                                                   │
│        [添加]      [取消]                          │
└─────────────────────────────────────────────────┘
```

### 7. 导出功能

#### ZIP压缩包导出：
```
导出配置：
┌───────────────── Export Configuration ──────────────┐
│                                                   │
│  选择平台:                                       │
│  ☑️ Android  ☑️ iOS  ☑️ Flutter                 │
│                                                   │
│  压缩包名称:                                      │
│  [i18n_resources.zip]                           │
│                                                   │
│        [导出ZIP]      [导出Excel]               │
└─────────────────────────────────────────────────┘
```

#### ZIP包结构：
```
i18n_resources.zip
├── android/
│   ├── values/
│   │   └── strings.xml (默认语言)
│   └── values-zh-rCN/
│       └── strings.xml
│   └── values-ja/
│       └── strings.xml
│
├── ios/
│   ├── en.lproj/
│   │   └── Localizable.strings
│   └── zh-Hans.lproj/
│       └── Localizable.strings
│   └── ja.lproj/
│       └── Localizable.strings
│
└── flutter/
    ├── lib/l10n/
    │   ├── app_en.arb
    │   ├── app_zh.arb
    │   └── app_ja.arb
```

### 8. 项目管理（桌面应用特有）

#### 菜单操作：
```
文件菜单：
┌─────────────────┐
│  文件 (F)        │
│  ──────────────── │
│  📂 打开项目...   │
│  💾 保存项目...   │
│  ──────────────── │
│  📊 导入Excel...   │
│  📊 导出Excel...   │
│  ──────────────── │
│  ❌ 退出 (Q)      │
└─────────────────┘
```

#### 项目文件格式：
```json
{
  "version": "1.0.0",
  "created": "2024-01-15T10:30:00Z",
  "columns": [
    {
      "langCode": "en-US",
      "androidFile": "strings.xml",
      "androidPath": "values/",
      "iosFile": "Localizable.strings",
      "iosPath": "en.lproj/",
      "flutterFile": "app_en.arb",
      "flutterPath": "lib/l10n/"
    },
    {
      "langCode": "zh-CN",
      "androidFile": "strings.xml",
      "androidPath": "values-zh-rCN/",
      "iosFile": "Localizable.strings",
      "iosPath": "zh-Hans.lproj/",
      "flutterFile": "app_zh.arb",
      "flutterPath": "lib/l10n/"
    }
  ],
  "data": [
    {"key": "app_name", "en-US": "My App", "zh-CN": "我的应用"},
    {"key": "welcome", "en-US": "Welcome", "zh-CN": "欢迎"}
  ]
}
```

## 🔧 高级功能

### 快捷键对照表

| 功能 | Windows | macOS | Linux |
|------|---------|-------|-------|
| 打开项目 | `Ctrl + O` | `Cmd + O` | `Ctrl + O` |
| 保存项目 | `Ctrl + S` | `Cmd + S` | `Ctrl + S` |
| 导入Excel | — | — | — |
| 导出ZIP | — | — | — |
| 撤销 | `Ctrl + Z` | `Cmd + Z` | `Ctrl + Z` |
| 重做 | `Ctrl + Y` | `Cmd + Y` | `Ctrl + Y` |
| 全选 | `Ctrl + A` | `Cmd + A` | `Ctrl + A` |
| 开发者工具 | `F12` | `F12` | `F12` |
| 退出应用 | `Alt + F4` | `Cmd + Q` | `Ctrl + Q` |

### API配置

#### 配置Gemini API：
1. 在菜单栏选择 "⚙️"
2. 在API设置中输入你的Gemini API密钥
3. 密钥会安全存储在本地

#### API密钥格式：
```
API密钥: AIzaSy...（你的Gemini API密钥）
```

## 📱 支持的平台和格式

### Android
- **格式**: XML
- **文件**: `strings.xml`
- **路径**: `values-{lang}/`
- **示例**: `values-zh-rCN/strings.xml`

### iOS
- **格式**: Key-Value
- **文件**: `Localizable.strings`
- **路径**: `{lang}.lproj/`
- **示例**: `zh-Hans.lproj/Localizable.strings`

### Flutter
- **格式**: JSON (ARB)
- **文件**: `app_{lang}.arb`
- **路径**: `lib/l10n/`
- **示例**: `lib/l10n/app_zh.arb`

## 🆘 故障排除

### 常见问题

**Q: Excel文件导入失败**
A: 检查文件格式，确保第一列是`Key`，内容使用UTF-8编码

**Q: AI翻译不工作**
A: 检查API密钥配置，确保网络连接正常

**Q: 导出的文件格式不正确**
A: 检查目标平台的文件路径配置

**Q: 项目文件无法打开**
A: 确保文件是有效的JSON格式，没有被损坏

### 技术支持

- 📧 邮箱: contact@polyglot-master.com
- 🐛 GitHub Issues: [项目问题反馈]
- 📖 文档: [在线帮助文档]

---

**感谢使用 Polyglot Master！** 🎉

如有问题或建议，欢迎通过上述渠道联系我们。