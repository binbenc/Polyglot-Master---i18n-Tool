#!/bin/bash

# 准备构建环境脚本
# 处理图标文件问题，确保 electron-builder 能正常工作

echo "🔧 Preparing build environment..."

# 检查并修复 Linux 图标配置
if [ ! -f "assets/icon.png" ] || ! file assets/icon.png | grep -q "PNG"; then
  echo "⚠️  Invalid or missing icon.png for Linux build"

  # 检查是否有其他可用的图标文件
  if [ -f "assets/icon.ico" ]; then
    echo "✅ Using icon.ico as fallback"
    # 临时修改 package.json，移除 Linux 的 icon 配置
    sed -i.bak 's/"icon": "assets\/",/"icon": "assets\/icon.ico",/' package.json
  elif [ -f "assets/icon.icns" ]; then
    echo "✅ Using icon.icns as fallback"
    sed -i.bak 's/"icon": "assets\/",/"icon": "assets\/icon.icns",/' package.json
  else
    echo "⚠️  No valid icons found, building without icons"
    # 创建一个临时的 package.json 移除所有 icon 配置
    cp package.json package.json.bak
    # 使用 Python 或其他工具移除 icon 字段
    if command -v python3 &> /dev/null; then
      python3 -c "
import json
import sys

with open('package.json', 'r') as f:
    data = json.load(f)

# 移除 Linux 的 icon 配置
if 'linux' in data['build'] and 'icon' in data['build']['linux']:
    del data['build']['linux']['icon']

with open('package.json', 'w') as f:
    json.dump(data, f, indent=2)
"
    fi
  fi
fi

echo "✅ Build preparation completed"