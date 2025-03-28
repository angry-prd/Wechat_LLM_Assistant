import fs from 'fs';
import path from 'path';

// 日志级别
export enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  DEBUG = 'DEBUG'
}

// 日志记录器类
class Logger {
  private logDir: string;
  private logFile: string;

  constructor() {
    this.logDir = path.join(process.cwd(), 'logs');
    this.logFile = path.join(this.logDir, 'app.log');
    this.ensureLogDirectory();
  }

  private ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private formatMessage(level: LogLevel, message: string, error?: any): string {
    const timestamp = new Date().toISOString();
    let logMessage = `[${timestamp}] ${level}: ${message}`;
    
    if (error) {
      if (error instanceof Error) {
        logMessage += `\nError: ${error.message}\nStack: ${error.stack}`;
      } else {
        logMessage += `\nError: ${JSON.stringify(error)}`;
      }
    }
    
    return logMessage + '\n';
  }

  private async writeLog(message: string) {
    try {
      await fs.promises.appendFile(this.logFile, message);
    } catch (error) {
      console.error('Failed to write log:', error);
    }
  }

  public async info(message: string) {
    const logMessage = this.formatMessage(LogLevel.INFO, message);
    await this.writeLog(logMessage);
  }

  public async warn(message: string) {
    const logMessage = this.formatMessage(LogLevel.WARN, message);
    await this.writeLog(logMessage);
  }

  public async error(message: string, error?: any) {
    const logMessage = this.formatMessage(LogLevel.ERROR, message, error);
    await this.writeLog(logMessage);
  }

  public async debug(message: string) {
    const logMessage = this.formatMessage(LogLevel.DEBUG, message);
    await this.writeLog(logMessage);
  }
}

export const logger = new Logger();