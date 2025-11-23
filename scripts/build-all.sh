#!/bin/bash

# Polyglot Master 多平台构建脚本
# 使用国内镜像源加速构建

echo "🚀 开始构建 Polyglot Master 桌面应用..."

# 设置环境变量
export ELECTRON_MIRROR=https://registry.npmmirror.com/-/binary/electron/
export ELECTRON_BUILDER_BINARIES_MIRROR=https://registry.npmmirror.com/-/binary/electron-builder-binaries/

# 构建 Electron 主进程
echo "🔨 构建 Electron 主进程..."
node scripts/build-electron.cjs

if [ $? -ne 0 ]; then
    echo "❌ Electron 主进程构建失败"
    exit 1
fi

# 构建 Web 应用
echo "📦 构建 Web 应用..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Web 应用构建失败"
    exit 1
fi

# 根据参数构建不同平台
if [ "$1" = "win" ] || [ "$1" = "windows" ]; then
    echo "🪟 构建 Windows 应用..."
    npx electron-builder --win
elif [ "$1" = "mac" ] || [ "$1" = "macos" ]; then
    echo "🍎 构建 macOS 应用..."
    npx electron-builder --mac
elif [ "$1" = "linux" ]; then
    echo "🐧 构建 Linux 应用..."
    npx electron-builder --linux
else
    echo "🌍 构建所有平台..."
    npx electron-builder --mac --win --linux
fi

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 构建完成！"
    echo "📁 安装包位置: release/"
    echo ""
    ls -lh release/*.dmg release/*.exe release/*.AppImage 2>/dev/null | head -10
else
    echo "❌ 构建失败"
    exit 1
fi