/**
 * Система логирования в файл для отладки
 * Записывает логи на сервер для анализа проблем
 */

export interface LogEntry {
  timestamp: string;
  level: 'INFO' | 'ERROR' | 'WARN' | 'DEBUG';
  category: string;
  message: string;
  data?: any;
  url?: string;
  userAgent?: string;
  mode?: string;
}

class FileLogger {
  private logs: LogEntry[] = [];
  private maxLogs = 100;
  private isEnabled = true;

  constructor() {
    this.logSystemInfo();
  }

  private logSystemInfo(): void {
    this.log('INFO', 'SYSTEM', 'FileLogger initialized', {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      mode: import.meta.env.MODE,
      dev: import.meta.env.DEV,
      prod: import.meta.env.PROD,
    });
  }

  log(level: LogEntry['level'], category: string, message: string, data?: any): void {
    if (!this.isEnabled) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      data,
      url: window.location.href,
      userAgent: navigator.userAgent,
      mode: import.meta.env.MODE,
    };

    this.logs.push(entry);

    // Ограничиваем количество логов
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Выводим в консоль тоже
    console.log(`[${level}] [${category}] ${message}`, data || '');

    // Отправляем на сервер периодически
    this.sendLogsToServer();
  }

  logAppMode(mode: 'LOCAL' | 'PROD', config: any): void {
    this.log('INFO', 'APP_MODE', `Application started in ${mode} mode`, {
      mode,
      config,
      environment: {
        MODE: import.meta.env.MODE,
        DEV: import.meta.env.DEV,
        PROD: import.meta.env.PROD,
      }
    });
  }

  logApiRequest(method: string, url: string, fullUrl: string, hasToken: boolean): void {
    this.log('INFO', 'API_REQUEST', `${method} ${url}`, {
      method,
      url,
      fullUrl,
      hasToken,
      timestamp: new Date().toISOString()
    });
  }

  logApiError(method: string, url: string, error: any): void {
    this.log('ERROR', 'API_ERROR', `${method} ${url} failed`, {
      method,
      url,
      error: error.message || 'Unknown error',
      status: error.response?.status,
      responseData: error.response?.data,
      timestamp: new Date().toISOString()
    });
  }

  logConfigDebug(message: string, config: any): void {
    this.log('DEBUG', 'CONFIG', message, config);
  }

  private async sendLogsToServer(): Promise<void> {
    // Отправляем логи каждые 10 записей или каждые 30 секунд
    if (this.logs.length % 10 === 0) {
      try {
        // В реальном приложении здесь был бы запрос на сервер
        // Пока просто сохраняем в localStorage
        const existingLogs = localStorage.getItem('app_debug_logs') || '[]';
        const allLogs = JSON.parse(existingLogs);
        allLogs.push(...this.logs);
        
        // Ограничиваем размер
        if (allLogs.length > 500) {
          allLogs.splice(0, allLogs.length - 500);
        }
        
        localStorage.setItem('app_debug_logs', JSON.stringify(allLogs));
        
        this.log('DEBUG', 'LOGGER', `Saved ${this.logs.length} logs to localStorage`);
      } catch (error) {
        console.error('Failed to save logs:', error);
      }
    }
  }

  // Методы для получения логов
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  getLogsAsText(): string {
    return this.logs.map(log => 
      `[${log.timestamp}] [${log.level}] [${log.category}] ${log.message} ${log.data ? JSON.stringify(log.data) : ''}`
    ).join('\n');
  }

  downloadLogs(): void {
    const logsText = this.getLogsAsText();
    const blob = new Blob([logsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `app-logs-${new Date().toISOString().slice(0, 19)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  clearLogs(): void {
    this.logs = [];
    localStorage.removeItem('app_debug_logs');
    this.log('INFO', 'LOGGER', 'Logs cleared');
  }
}

// Создаем единственный экземпляр
export const fileLogger = new FileLogger();

// Экспорт для использования в других модулях
export default fileLogger; 