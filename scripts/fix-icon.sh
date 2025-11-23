#!/bin/bash

# 修复图标文件的脚本
# 如果当前图标无效，则创建一个简单的占位符或移除图标引用

echo "🔧 Fixing icon configuration..."

# 检查当前图标文件
ICON_FILE="assets/icon.png"

if [ -f "$ICON_FILE" ]; then
    # 检查文件是否为有效的 PNG
    if file "$ICON_FILE" | grep -q "PNG"; then
        echo "✅ Valid PNG icon found"
        exit 0
    else
        echo "⚠️  Invalid icon file detected, removing..."
        rm "$ICON_FILE"
    fi
fi

# 创建 assets 目录（如果不存在）
mkdir -p assets

# 选项 1: 尝试创建一个简单的 PNG 图标
if command -v convert &> /dev/null; then
    echo "📝 Creating simple icon with ImageMagick..."
    convert -size 256x256 xc:'#4285F4' \
        -fill white -pointsize 120 -gravity center -annotate +0-20 "P" \
        -fill white -pointsize 24 -gravity center -annotate +0+40 "Master" \
        "$ICON_FILE" 2>/dev/null || echo "ImageMagick icon creation failed"
fi

# 如果没有成功创建图标，检查是否需要修改 package.json
if [ ! -f "$ICON_FILE" ]; then
    echo "⚠️  No valid icon available, building without icon"

    # 备份原始 package.json
    cp package.json package.json.backup

    # 移除 Linux 构建的 icon 配置
    sed -i.tmp '/"linux": {/,/}/{ s/"icon": "[^"]*",//; }' package.json
    sed -i.tmp '/"linux": {/,/}/{ s/, *$/}/; }' package.json

    # 清理临时文件
    rm -f package.json.tmp

    echo "✅ Updated package.json to build without icon"
else
    echo "✅ Icon ready for build"
fi