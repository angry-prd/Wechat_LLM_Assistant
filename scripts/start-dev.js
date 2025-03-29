#!/usr/bin/env node

/**
 * 启动开发服务器脚本
 * 如果端口3000被占用，自动结束占用进程并重启
 */

const { exec, spawn } = require('child_process');
const os = require('os');

// 检查操作系统
const platform = os.platform();

console.log('启动开发服务器...');
console.log('第一步: 检查并释放端口 3000');

// 根据不同操作系统使用适当的命令查找占用端口3000的进程
const findProcessCommand = platform === 'win32' 
  ? 'netstat -ano | findstr :3000' 
  : 'lsof -i :3000 -t';

// 执行查找进程命令
exec(findProcessCommand, (error, stdout, stderr) => {
  if (error && !stdout) {
    console.log('端口3000当前没有被占用，直接启动开发服务器');
    startDevServer();
    return;
  }

  // 获取进程ID列表
  let pids = [];
  if (platform === 'win32') {
    // Windows处理方式
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
    // Unix系统处理方式
    pids = stdout.trim().split('\n');
  }

  if (pids.length === 0) {
    console.log('没有找到占用端口3000的进程，直接启动开发服务器');
    startDevServer();
    return;
  }

  console.log(`找到以下进程占用端口3000: ${pids.join(', ')}`);
  
  // 终止所有占用端口的进程
  const killCommand = platform === 'win32' 
    ? `taskkill /F /PID ${pids.join(' /PID ')}` 
    : `kill -9 ${pids.join(' ')}`;
  
  console.log(`正在终止进程: ${killCommand}`);
  
  exec(killCommand, (killError, killStdout, killStderr) => {
    if (killError) {
      console.error(`终止进程时出错: ${killError.message}`);
      console.error('尝试使用不同端口启动');
      startDevServer(3001);
      return;
    }
    
    console.log('成功终止所有占用端口3000的进程');
    
    // 等待一秒以确保端口完全释放
    setTimeout(() => {
      startDevServer();
    }, 1000);
  });
});

// 启动开发服务器
function startDevServer(port = 3000) {
  console.log(`第二步: 启动Next.js开发服务器在端口 ${port}`);
  
  // 使用spawn而非exec，可以将输出直接传递到控制台
  const nextProcess = spawn('npx', ['next', 'dev', '-p', port.toString()], {
    stdio: 'inherit', // 继承父进程的stdio，这样输出会直接显示在控制台
    shell: true
  });
  
  // 处理进程退出
  nextProcess.on('close', (code) => {
    if (code !== 0) {
      console.log(`开发服务器异常退出，退出码: ${code}`);
    }
  });
  
  // 处理错误
  nextProcess.on('error', (err) => {
    console.error(`启动开发服务器时出错: ${err.message}`);
  });
} 