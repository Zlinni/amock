import fs from "fs";
import path from "path";
import { format } from "date-fns";

class Logger {
  private logDir: string;
  private logFile: string;

  constructor() {
    this.logDir = path.join(process.cwd(), "logs");
    this.logFile = path.join(
      this.logDir,
      `${format(new Date(), "yyyy-MM-dd")}.log`
    );
    this.ensureLogDir();
  }

  private ensureLogDir() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private formatDuration(startTime: number): string {
    const duration = Date.now() - startTime;
    if (duration < 1000) {
      return `${duration}ms`;
    }
    return `${(duration / 1000).toFixed(2)}s`;
  }

  async logTask(taskName: string, fn: () => Promise<any>): Promise<any> {
    const startTime = Date.now();
    const timestamp = format(new Date(), "yyyy-MM-dd HH:mm:ss");

    try {
      const result = await fn();
      const duration = this.formatDuration(startTime);

      const logEntry = `[${timestamp}] ${taskName} - 完成 (耗时: ${duration})\n`;
      fs.appendFileSync(this.logFile, logEntry);

      return result;
    } catch (error) {
      const duration = this.formatDuration(startTime);
      const errorMessage = error instanceof Error ? error.message : "未知错误";

      const logEntry = `[${timestamp}] ${taskName} - 失败 (耗时: ${duration}, 错误: ${errorMessage})\n`;
      fs.appendFileSync(this.logFile, logEntry);

      throw error;
    }
  }
}

export const logger = new Logger();
