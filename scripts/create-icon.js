#!/usr/bin/env node

/**
 * 创建简单的 PNG 图标文件
 * 使用 Canvas API 生成一个基础的应用图标
 */

const fs = require('fs');
const path = require('path');

// 创建一个简单的 256x256 PNG 图标
function createIcon() {
  const size = 256;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // 背景圆形 - 蓝色渐变
  const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
  gradient.addColorStop(0, '#4285F4');
  gradient.addColorStop(1, '#1a73e8');

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(size/2, size/2, size/2 - 10, 0, 2 * Math.PI);
  ctx.fill();

  // 添加 "P" 字母代表 Polyglot
  ctx.fillStyle = 'white';
  ctx.font = 'bold 120px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('P', size/2, size/2);

  // 添加小文字 "Master"
  ctx.font = '20px Arial';
  ctx.fillText('Master', size/2, size/2 + 60);

  // 保存为 PNG
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(__dirname, '../assets/icon.png'), buffer);

  console.log('✅ Icon created successfully at assets/icon.png');
}

// 使用 node-canvas 创建图片
function createCanvas(width, height) {
  try {
    // 尝试使用 node-canvas
    const { createCanvas } = require('canvas');
    return createCanvas(width, height);
  } catch (error) {
    // 如果没有 node-canvas，创建一个最小的 PNG 文件
    return createMinimalPNG(width, height);
  }
}

// 创建最小的 PNG 文件（如果无法使用 Canvas）
function createMinimalPNG(width, height) {
  // 这是一个简单的 PNG 文件生成器
  const buffer = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    // IHDR chunk (简化版本)
    0x00, 0x00, 0x00, 0x0D, // Chunk length
    0x49, 0x48, 0x44, 0x52, // "IHDR"
    0x00, 0x00, 0x01, 0x00, // Width: 256
    0x00, 0x00, 0x01, 0x00, // Height: 256
    0x08, 0x02, 0x00, 0x00, 0x00, // Bit depth, color type, compression, filter, interlace
    // CRC (简化)
    0x00, 0x00, 0x00, 0x00,
    // IDAT chunk (最小数据)
    0x00, 0x00, 0x00, 0x0C,
    0x49, 0x44, 0x41, 0x54,
    0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0x00, 0x00,
    0x00, 0x02, 0x00, 0x01,
    // IEND chunk
    0x00, 0x00, 0x00, 0x00,
    0x49, 0x45, 0x4E, 0x44,
    0xAE, 0x42, 0x60, 0x82
  ]);

  return {
    getContext: () => ({
      fillStyle: '',
      font: '',
      textAlign: '',
      textBaseline: '',
      createLinearGradient: () => ({ addColorStop: () => {} }),
      beginPath: () => {},
      arc: () => {},
      fill: () => {},
      fillText: () => {},
      font: '120px Arial'
    }),
    toBuffer: () => buffer
  };
}

// 主函数
function main() {
  const assetsDir = path.join(__dirname, '../assets');

  // 确保 assets 目录存在
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  // 检查是否已有有效的 PNG 文件
  const iconPath = path.join(assetsDir, 'icon.png');
  if (fs.existsSync(iconPath)) {
    const stats = fs.statSync(iconPath);
    // 如果文件大于 1KB，可能是有效的图片
    if (stats.size > 1024) {
      console.log('✅ Valid icon already exists');
      return;
    }
  }

  try {
    createIcon();
  } catch (error) {
    console.log('⚠️  Could not create icon, building without icon');
    console.log('   Error:', error.message);
  }
}

if (require.main === module) {
  main();
}

module.exports = { createIcon };