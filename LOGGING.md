# Система логирования Coffee Shop Manager

## Обзор

В приложении Coffee Shop Manager реализована комплексная система логирования для отладки и мониторинга. Система позволяет отслеживать:

- 🔗 **API запросы и ответы** - все HTTP запросы с временем выполнения
- 👤 **Действия пользователя** - клики, навигация, формы
- 🔧 **Состояние компонентов** - монтирование, обновления
- ❌ **Ошибки** - JavaScript ошибки, API ошибки
- ⚡ **Производительность** - измерение времени выполнения

## Как использовать

### 1. Просмотр логов в интерфейсе

В приложении есть **плавающая кнопка с иконкой бага** в правом нижнем углу:

- 🔵 **Синяя кнопка** - все в порядке
- 🔴 **Красная кнопка с цифрой** - есть ошибки (показывает количество)

**Клик по кнопке** открывает окно просмотра логов с:
- Фильтрацией по уровню (Debug, Info, Warning, Error)
- Фильтрацией по категории (API_REQUEST, USER_ACTION, etc.)
- Поиском по тексту
- Экспортом в JSON файл
- Очисткой логов

### 2. Просмотр логов в консоли браузера

Все логи дублируются в консоль браузера с эмодзи иконками:
- 🔍 Debug - серый цвет
- ℹ️ Info - синий цвет  
- ⚠️ Warning - оранжевый цвет
- ❌ Error - красный цвет

### 3. Уровни логирования

Система поддерживает 4 уровня логирования:

```typescript
enum LogLevel {
  DEBUG = 0,    // Подробная отладочная информация
  INFO = 1,     // Общая информация о работе приложения
  WARN = 2,     // Предупреждения о потенциальных проблемах
  ERROR = 3     // Ошибки, требующие внимания
}
```

**В режиме разработки** - показываются все логи (DEBUG+)
**В продакшене** - только предупреждения и ошибки (WARN+)

## Категории логов

### API Логи
- `API_REQUEST` - исходящие HTTP запросы
- `API_RESPONSE` - входящие HTTP ответы  
- `API_ERROR` - ошибки API запросов

### Пользовательские действия
- `USER_ACTION` - клики, отправка форм, навигация
- `AUTH` - аутентификация, выход из системы

### Системные логи
- `COMPONENT_STATE` - состояние React компонентов
- `NAVIGATION` - переходы между страницами
- `PERFORMANCE` - измерения производительности
- `UNHANDLED_ERROR` - необработанные JavaScript ошибки

## Полезные сценарии тестирования

### 1. Тестирование API
```
1. Откройте логи
2. Попробуйте выполнить действие без авторизации
3. Увидите:
   - API_REQUEST: запрос к API
   - API_ERROR: ошибка авторизации
   - AUTH: обработка ошибки авторизации
```

### 2. Тестирование навигации
```
1. Войдите в систему
2. Переключайтесь между разделами (Заказы, Продукты, etc.)
3. Увидите:
   - USER_ACTION: navigate in Dashboard
   - Данные о переходе from/to
```

### 3. Тестирование загрузки данных
```
1. Обновите страницу или войдите в систему
2. Увидите:
   - COMPONENT_STATE: Dashboard mounted
   - API_REQUEST: GET /orders/, GET /shifts/
   - API_RESPONSE: успешные ответы с данными
   - Dashboard: Dashboard data loaded successfully
```

### 4. Поиск ошибок
```
1. Фильтруйте логи по уровню "Error"
2. Увидите все ошибки с подробностями:
   - Stack trace для JavaScript ошибок
   - HTTP статус коды для API ошибок
   - Контекстные данные
```

## Экспорт логов

Для отправки логов разработчикам:

1. Откройте окно логов
2. Нажмите кнопку экспорта (💾)
3. Сохранится файл `coffee-shop-logs-YYYY-MM-DD.json`
4. Отправьте файл разработчикам

## Продвинутое использование

### Фильтрация в консоли

В консоли браузера можно использовать фильтры:
```javascript
// Только API запросы
console.clear(); // очистить консоль, затем смотреть новые логи

// В поле фильтра консоли введите:
API_REQUEST

// Или для ошибок:
❌
```

### Программное использование

Для разработчиков - можно добавлять собственные логи:

```typescript
import { logger } from './services/logger';

// Информационное сообщение
logger.info('MyComponent', 'Data loaded successfully', { count: 42 });

// Ошибка
logger.error('MyComponent', 'Failed to save data', error);

// Действие пользователя
logger.userAction('button_click', 'MyComponent', { buttonId: 'save' });

// Измерение производительности
const stopTimer = logger.startTimer('data_processing');
// ... выполнение кода ...
stopTimer(); // автоматически залогирует время выполнения
```

## Настройки

По умолчанию система хранит последние **1000 логов** в памяти. Старые логи автоматически удаляются.

Для изменения настроек (только для разработчиков):

```typescript
// Изменить максимальное количество логов
logger.setMaxLogs(2000);

// Изменить уровень логирования
logger.setLogLevel(LogLevel.ERROR); // только ошибки
```

## Производительность

Система логирования спроектирована для минимального влияния на производительность:

- Логи обрабатываются асинхронно
- В продакшене отключены Debug логи
- Автоматическая очистка старых логов
- Эффективная сериализация данных

---

**💡 Совет:** Держите окно логов открытым во время тестирования - вы увидите в реальном времени все, что происходит в приложении! 