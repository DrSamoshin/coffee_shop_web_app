# Coffee Shop Management System

Современное веб-приложение для управления кофейней, построенное на React, TypeScript и Material-UI.

## 🚀 Возможности

- **Аутентификация по токену** - безопасный вход в систему через API токен
- **Dashboard** - главная панель с ключевыми метриками кофейни
- **Управление заказами** - создание, просмотр и обновление статуса заказов
- **Управление продуктами** - добавление и редактирование товаров и категорий
- **Управление складом** - учет товаров на складе и поставки
- **Аналитика** - графики продаж и статистика
- **Управление сменами** - начало и окончание рабочих смен
- **Управление сотрудниками** - учет персонала

## 🛠 Технологии

- **Frontend**: React 19, TypeScript, Material-UI (MUI)
- **HTTP Client**: Axios
- **Charts**: Recharts
- **Build Tool**: Vite
- **Backend API**: 0.0.0.0:8080

## 📦 Установка и запуск

### Предварительные требования

- Node.js (версия 16 или выше)
- npm или yarn

### Установка

1. Клонируйте репозиторий:
```bash
git clone <your-repo-url>
cd coffee_shop_web_app
```

2. Установите зависимости:
```bash
npm install
```

3. Запустите приложение в режиме разработки:
```bash
npm run dev
```

4. Откройте браузер и перейдите по адресу: `http://localhost:5173`

### Сборка для продакшена

```bash
npm run build
```

## 🔑 Настройка окружения

### Переменные окружения

1. Скопируйте файл с примером:
```bash
cp .env.example .env.local
```

2. Отредактируйте `.env.local` под ваши нужды:
```env
# Админ режим (показывает дополнительные кнопки)
VITE_ADMIN_MODE=true

# API Configuration
VITE_API_BASE_URL=http://0.0.0.0:8080
VITE_CURRENCY=BYN

# Feature flags
VITE_ENABLE_LOGGING=true
```

### Получение токена доступа

Для работы с приложением вам необходим токен доступа к API кофейни. Обратитесь к администратору системы для получения токена.

## 🎯 Использование

### 1. Вход в систему

При первом запуске приложения вы увидите страницу входа. Введите ваш токен доступа для подключения к API кофейни.

### 2. Главная панель (Dashboard)

После успешного входа вы попадете на главную панель, где отображаются:
- Общая выручка
- Количество заказов
- Активные смены
- Заказы в ожидании

### 3. Навигация

Используйте боковое меню для перехода между разделами:
- **Главная** - основная статистика
- **Заказы** - управление заказами
- **Продукты** - каталог товаров
- **Склад** - управление запасами
- **Аналитика** - отчеты и графики
- **Сотрудники** - управление персоналом

## 🔧 API Endpoints

Приложение взаимодействует со следующими основными эндпоинтами:

- `GET /health/token/` - проверка токена
- `GET /orders/` - получение списка заказов
- `POST /orders/` - создание нового заказа
- `PATCH /orders/status-update/{id}/` - обновление статуса заказа
- `GET /products/` - получение списка продуктов
- `POST /products/` - создание нового продукта
- `GET /categories/` - получение категорий
- `GET /shifts/active-shifts/` - получение активных смен
- `GET /employees/` - получение списка сотрудников

## 🎨 Особенности дизайна

- **Адаптивный дизайн** - приложение работает на всех устройствах
- **Material Design** - современный и интуитивный интерфейс
- **Кофейная тематика** - цветовая схема в стиле кофейни
- **Удобная навигация** - быстрый доступ ко всем функциям

## 🚨 Обработка ошибок

Приложение включает комплексную обработку ошибок:
- Автоматическая проверка валидности токена
- Переадресация на страницу входа при ошибках аутентификации
- Пользовательские уведомления об ошибках
- Graceful fallback при недоступности API

## 🔒 Безопасность

- Токен хранится в localStorage
- Автоматическое добавление токена к каждому API запросу
- Автоматический выход при истечении токена
- HTTPS подключение к API

## 📱 Мобильная версия

Приложение полностью адаптировано для мобильных устройств с:
- Адаптивным меню
- Оптимизированными формами
- Touch-friendly интерфейсом

## 🐛 Отладка

Для отладки включите Developer Tools в браузере. Все API запросы и ошибки логируются в консоль.

## 📄 Лицензия

Этот проект создан для демонстрационных целей. Все права защищены.

## 🤝 Поддержка

При возникновении вопросов или проблем обратитесь к команде разработки.
