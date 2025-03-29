#!/usr/bin/env node

/**
 * 彻底清理并重启开发服务器
 * 清理缓存、node_modules/.cache、.next 目录，然后重启服务器
 */

const { exec, spawn } = require('child_process');
const os = require('os');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const execAsync = promisify(exec);
const platform = os.platform();

async function main() {
  console.log('=== 开始彻底清理和重启开发服务器 ===');
  
  // 1. 停止所有Next.js进程
  console.log('步骤1: 停止所有Next.js进程');
  try {
    if (platform === 'win32') {
      await execAsync('taskkill /F /IM node.exe /FI "WINDOWTITLE eq next*" 2>nul || echo 没有找到Next.js进程');
    } else {
      await execAsync('pkill -f "node.*next" || echo 没有找到Next.js进程');
    }
    console.log('所有Next.js进程已停止');
  } catch (error) {
    console.log('没有正在运行的Next.js进程');
  }

  // 2. 清理构建缓存
  console.log('步骤2: 清理构建缓存');
  const cacheDirs = [
    path.join(process.cwd(), '.next'),
    path.join(process.cwd(), 'node_modules', '.cache')
  ];

  for (const dir of cacheDirs) {
    try {
      if (fs.existsSync(dir)) {
        if (platform === 'win32') {
          await execAsync(`rmdir /S /Q "${dir}"`);
        } else {
          await execAsync(`rm -rf "${dir}"`);
        }
        console.log(`已删除: ${dir}`);
      }
    } catch (error) {
      console.error(`删除 ${dir} 时出错:`, error.message);
    }
  }

  // 3. 释放端口3000
  console.log('步骤3: 检查并释放端口 3000');
  try {
    const findProcessCommand = platform === 'win32' 
      ? 'netstat -ano | findstr :3000' 
      : 'lsof -i :3000 -t';
    
    const { stdout } = await execAsync(findProcessCommand);
    
    if (stdout.trim()) {
      let pids = [];
      if (platform === 'win32') {
        const lines = stdout.split('\n');
        for (const line of lines) {
          if (line.includes('LISTENING')) {
            const match = line.match(/\s+(\d+)$/);
            if (match && match[1]) {
              pids.push(match[1]);
            }
          }
        }
      } else {
        pids = stdout.trim().split('\n');
      }
      
      if (pids.length > 0) {
        console.log(`找到以下进程占用端口3000: ${pids.join(', ')}`);
        
        const killCommand = platform === 'win32' 
          ? `taskkill /F /PID ${pids.join(' /PID ')}` 
          : `kill -9 ${pids.join(' ')}`;
        
        console.log(`正在终止进程: ${killCommand}`);
        await execAsync(killCommand);
        console.log('成功终止所有占用端口3000的进程');
      }
    } else {
      console.log('端口3000当前没有被占用');
    }
  } catch (error) {
    if (!error.stdout || error.stdout.trim() === '') {
      console.log('端口3000当前没有被占用');
    } else {
      console.error('检查端口时出错:', error.message);
    }
  }

  // 4. 等待一秒以确保端口完全释放
  console.log('等待端口释放...');
  await new Promise(resolve => setTimeout(resolve, 1000));

  // 5. 启动开发服务器
  console.log('步骤4: 启动Next.js开发服务器');

  const nextProcess = spawn('npx', ['next', 'dev', '-p', '3000'], {
    stdio: 'inherit', 
    shell: true
  });
  
  nextProcess.on('close', (code) => {
    if (code !== 0) {
      console.log(`开发服务器异常退出，退出码: ${code}`);
    }
  });
  
  nextProcess.on('error', (err) => {
    console.error(`启动开发服务器时出错: ${err.message}`);
  });
}

main().catch(error => {
  console.error('执行清理和重启过程时出错:', error);
}); 