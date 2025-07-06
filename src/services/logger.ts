// Система логирования для отладки приложения
import { loggingConfig } from '../config';

// Уровни логирования
export const LogLevel = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error'
} as const;

export type LogLevel = typeof LogLevel[keyof typeof LogLevel];

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  category: string;
  message: string;
  data?: any;
  stack?: string;
}

class LoggerService {
  private logs: LogEntry[] = [];
  private maxLogs = loggingConfig.maxLogs;
  private currentLogLevel: LogLevel = LogLevel.DEBUG;
  private listeners: Array<(logs: LogEntry[]) => void> = [];

  // Настройка логирования
  setLogLevel(level: LogLevel): void {
    this.currentLogLevel = level;
    this.info('Logger', `Log level set to ${level}`);
  }

  setMaxLogs(max: number): void {
    this.maxLogs = max;
    this.trimLogs();
  }

  // Подписка на изменения логов
  subscribe(callback: (logs: LogEntry[]) => void): () => void {
    this.listeners.push(callback);
    callback([...this.logs]);
    
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Основной метод логирования
  private log(level: LogLevel, category: string, message: string, data?: any, error?: Error): void {
    // Проверяем уровень логирования по порядку важности
    const levelOrder = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    const currentIndex = levelOrder.indexOf(this.currentLogLevel);
    const messageIndex = levelOrder.indexOf(level);
    
    if (messageIndex < currentIndex) return;

    const logEntry: LogEntry = {
      id: this.generateId(),
      timestamp: new Date(),
      level,
      category,
      message,
      data: data ? this.serializeData(data) : undefined,
      stack: error?.stack
    };

    this.logs.push(logEntry);
    this.trimLogs();
    this.notifyListeners();

    // Дублируем в консоль браузера
    this.logToConsole(logEntry);
  }

  // Публичные методы для разных уровней логирования
  debug(category: string, message: string, data?: any): void {
    this.log(LogLevel.DEBUG, category, message, data);
  }

  info(category: string, message: string, data?: any): void {
    this.log(LogLevel.INFO, category, message, data);
  }

  warn(category: string, message: string, data?: any): void {
    this.log(LogLevel.WARN, category, message, data);
  }

  error(category: string, message: string, error?: Error, data?: any): void {
    this.log(LogLevel.ERROR, category, message, data, error);
  }

  // Специальные методы для API логирования
  apiRequest(method: string, url: string, data?: any): void {
    this.info('API_REQUEST', `${method} ${url}`, {
      method,
      url,
      payload: data,
      timestamp: new Date().toISOString()
    });
  }

  apiResponse(method: string, url: string, status: number, data?: any, duration?: number): void {
    const level = status >= 400 ? LogLevel.ERROR : LogLevel.INFO;
    const message = `${method} ${url} - ${status}${duration ? ` (${duration}ms)` : ''}`;
    
    this.log(level, 'API_RESPONSE', message, {
      method,
      url,
      status,
      response: data,
      duration,
      timestamp: new Date().toISOString()
    });
  }

  apiError(method: string, url: string, error: any): void {
    this.error('API_ERROR', `${method} ${url} failed`, error, {
      method,
      url,
      error: error.message || 'Unknown error',
      status: error.response?.status,
      timestamp: new Date().toISOString()
    });
  }

  // Логирование действий пользователя
  userAction(action: string, component: string, data?: any): void {
    this.info('USER_ACTION', `${action} in ${component}`, {
      action,
      component,
      data,
      timestamp: new Date().toISOString()
    });
  }

  // Логирование навигации
  navigation(from: string, to: string): void {
    this.info('NAVIGATION', `Navigate from ${from} to ${to}`, {
      from,
      to,
      timestamp: new Date().toISOString()
    });
  }

  // Логирование состояния компонентов
  componentState(component: string, state: string, data?: any): void {
    this.debug('COMPONENT_STATE', `${component}: ${state}`, {
      component,
      state,
      data,
      timestamp: new Date().toISOString()
    });
  }

  // Получение логов
  getLogs(category?: string, level?: LogLevel): LogEntry[] {
    let filteredLogs = [...this.logs];

    if (category) {
      filteredLogs = filteredLogs.filter(log => log.category === category);
    }

    if (level !== undefined) {
      filteredLogs = filteredLogs.filter(log => log.level >= level);
    }

    return filteredLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Очистка логов
  clearLogs(): void {
    this.logs = [];
    this.notifyListeners();
    this.info('Logger', 'Logs cleared');
  }

  // Экспорт логов
  exportLogs(): string {
    const logsForExport = this.logs.map(log => ({
      timestamp: log.timestamp.toISOString(),
      level: log.level,
      category: log.category,
      message: log.message,
      data: log.data,
      stack: log.stack
    }));

    return JSON.stringify(logsForExport, null, 2);
  }

  // Приватные методы
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private serializeData(data: any): any {
    try {
      return JSON.parse(JSON.stringify(data));
    } catch {
      return '[Circular or non-serializable data]';
    }
  }

  private trimLogs(): void {
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(callback => {
      try {
        callback([...this.logs]);
      } catch (error) {
        console.error('Error in log listener:', error);
      }
    });
  }

  private logToConsole(entry: LogEntry): void {
    const timestamp = entry.timestamp.toLocaleTimeString();
    const prefix = `[${timestamp}] [${entry.category}]`;
    
    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(`DEBUG ${prefix}`, entry.message, entry.data || '');
        break;
      case LogLevel.INFO:
        console.info(`INFO ${prefix}`, entry.message, entry.data || '');
        break;
      case LogLevel.WARN:
        console.warn(`WARN ${prefix}`, entry.message, entry.data || '');
        break;
      case LogLevel.ERROR:
        console.error(`ERROR ${prefix}`, entry.message, entry.data || '', entry.stack || '');
        break;
    }
  }

  // Методы для работы с performance
  startTimer(name: string): () => void {
    const startTime = performance.now();
    this.debug('PERFORMANCE', `Timer started: ${name}`);
    
    return () => {
      const duration = Math.round(performance.now() - startTime);
      this.info('PERFORMANCE', `Timer ${name}: ${duration}ms`, { duration });
      return duration;
    };
  }
}

// Экспортируем единственный экземпляр
export const logger = new LoggerService();

// Настраиваем логирование в зависимости от окружения
if (typeof window !== 'undefined') {
  logger.setLogLevel(LogLevel.DEBUG);
  logger.info('Logger', 'Development mode: All logs enabled');
}

// Логируем необработанные ошибки
window.addEventListener('error', (event) => {
  logger.error('UNHANDLED_ERROR', event.message, event.error, {
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno
  });
});

// Логируем необработанные Promise rejections
window.addEventListener('unhandledrejection', (event) => {
  logger.error('UNHANDLED_PROMISE_REJECTION', 'Unhandled promise rejection', event.reason);
});

export default logger; 