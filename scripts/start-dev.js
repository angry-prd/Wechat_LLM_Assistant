#!/usr/bin/env node

/**
 * 启动开发服务器脚本
 * 如果端口3000被占用，自动结束占用进程并重启
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// 检查scripts目录是否存在，不存在则创建
const scriptsDir = path.resolve(__dirname);
if (!fs.existsSync(scriptsDir)) {
  fs.mkdirSync(scriptsDir, { recursive: true });
}

// 要使用的端口
const PORT = 3000;

// 检查端口是否被占用并获取进程ID
function getProcessIdOnPort(port) {
  try {
    // MacOS和Linux的命令
    const command = `lsof -i :${port} -P -t -sTCP:LISTEN`;
    return execSync(command, { encoding: 'utf8' }).trim().split('\n')[0];
  } catch (e) {
    return null;
  }
}

// 释放端口，结束占用进程
function freePort(port) {
  try {
    const pid = getProcessIdOnPort(port);
    
    if (pid) {
      console.log(`端口 ${port} 被进程 ${pid} 占用，正在结束该进程...`);
      
      try {
        // 尝试优雅地结束进程
        execSync(`kill ${pid}`, { stdio: 'ignore' });
        console.log(`进程 ${pid} 已成功结束`);
      } catch (killError) {
        // 如果优雅结束失败，强制结束
        console.log(`优雅结束失败，正在强制结束进程 ${pid}...`);
        execSync(`kill -9 ${pid}`, { stdio: 'ignore' });
        console.log(`进程 ${pid} 已被强制结束`);
      }
      
      // 等待操作系统释放端口
      console.log('等待端口释放...');
      execSync('sleep 1');
    }
    
    return true;
  } catch (e) {
    console.error('释放端口失败:', e.message);
    return false;
  }
}

// 启动Next.js开发服务器
function startDevServer() {
  console.log(`正在启动Next.js开发服务器在端口 ${PORT}...`);
  
  const nextProcess = spawn('npx', ['next', 'dev', '-p', PORT], {
    stdio: 'inherit',
    shell: true
  });
  
  nextProcess.on('error', (err) => {
    console.error('启动开发服务器失败:', err);
  });
  
  return nextProcess;
}

// 主函数
function main() {
  console.log(`==== 微信公众号AI助手开发服务器启动工具 ====`);
  console.log(`检查端口 ${PORT} 是否可用...`);
  
  // 检查端口是否被占用
  const pid = getProcessIdOnPort(PORT);
  
  if (pid) {
    console.log(`端口 ${PORT} 被占用，正在尝试释放...`);
    const freed = freePort(PORT);
    
    if (!freed) {
      console.error(`无法释放端口 ${PORT}，请手动结束占用进程后重试`);
      process.exit(1);
    }
  } else {
    console.log(`端口 ${PORT} 空闲，可以使用`);
  }
  
  // 启动开发服务器
  const server = startDevServer();
  
  // 处理进程终止信号
  process.on('SIGINT', () => {
    console.log('收到终止信号，关闭开发服务器...');
    server.kill();
    process.exit(0);
  });
}

// 执行主函数
main(); 