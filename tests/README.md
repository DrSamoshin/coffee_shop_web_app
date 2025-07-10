# 🧪 Тестирование

## Структура тестов

```
tests/
├── unit/           # Unit тесты для отдельных компонентов и функций
├── integration/    # Integration тесты для API и сервисов  
└── e2e/           # End-to-end тесты пользовательских сценариев
```

## Покрытие

Цель: 90%+ покрытие согласно testing_contract.json

## Frameworks

- **Jest** - unit тесты
- **React Testing Library** - тестирование компонентов
- **Cypress** - e2e тесты

## Команды

```bash
npm run test           # Запуск всех тестов
npm run test:unit      # Unit тесты
npm run test:integration # Integration тесты
npm run test:e2e       # E2E тесты
npm run test:coverage  # Coverage отчет
``` 