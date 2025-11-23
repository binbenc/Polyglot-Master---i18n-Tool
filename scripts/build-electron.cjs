const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 构建 Electron 主进程
console.log('🔨 构建 Electron 主进程...');

try {
  // 确保目录存在
  const distElectronDir = path.join(__dirname, '../dist-electron');
  if (!fs.existsSync(distElectronDir)) {
    fs.mkdirSync(distElectronDir, { recursive: true });
  }

  // 使用 tsc 编译 TypeScript
  execSync('npx tsc electron/main.ts --outDir dist-electron --target es2020 --module commonjs --moduleResolution node --esModuleInterop --allowSyntheticDefaultImports --skipLibCheck', {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });

  execSync('npx tsc electron/preload.ts --outDir dist-electron --target es2020 --module commonjs --moduleResolution node --esModuleInterop --allowSyntheticDefaultImports --skipLibCheck', {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });

  // 重命名文件，将.js改为.cjs以避免ES模块问题
  if (fs.existsSync(path.join(__dirname, '../dist-electron/main.js'))) {
    fs.renameSync(
      path.join(__dirname, '../dist-electron/main.js'),
      path.join(__dirname, '../dist-electron/main.cjs')
    );
  }
  if (fs.existsSync(path.join(__dirname, '../dist-electron/preload.js'))) {
    fs.renameSync(
      path.join(__dirname, '../dist-electron/preload.js'),
      path.join(__dirname, '../dist-electron/preload.cjs')
    );
  }

  console.log('✅ Electron 主进程构建完成');

} catch (error) {
  console.error('❌ Electron 主进程构建失败:', error.message);
  process.exit(1);
}