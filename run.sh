#!/bin/bash

# Coffee Shop Web App Runner
# Скрипт для запуска приложения в разных режимах

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функция для логирования
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Функция помощи
show_help() {
    echo "Coffee Shop Web App Runner"
    echo ""
    echo "Использование: ./run.sh [РЕЖИМ]"
    echo ""
    echo "Режимы:"
    echo "  local     - Запуск для локальной разработки (прокси на localhost:8080)"
    echo "  prod      - Запуск для production (прокси на prod API через Vite)"
    echo "  dev       - Запуск в development режиме (npm run dev)"
    echo "  preview   - Запуск preview режима (npm run preview)"
    echo "  build     - Сборка для production"
    echo ""
    echo "Примеры:"
    echo "  ./run.sh local    # Локальная разработка (прокси на localhost:8080)"
    echo "  ./run.sh prod     # Production режим (прокси на prod API)"
    echo "  ./run.sh dev      # Development server"
    echo ""
}

# Создание .env файлов
create_local_env() {
    log "Создание .env файла для локального режима..."
    cat > .env.local << EOF
# Local development environment
VITE_USE_API_PROXY=true
VITE_API_BASE_URL=http://0.0.0.0:8080
VITE_API_TIMEOUT=10000
VITE_ADMIN_MODE=true
VITE_DEBUG_MODE=true
VITE_ENABLE_LOGGING=true
EOF
    log_success ".env.local создан для локального режима"
}

create_prod_env() {
    log "Создание .env файла для production режима..."
    cat > .env.production << EOF
# Production environment - используем прокси для избежания CORS
VITE_USE_API_PROXY=true
VITE_API_BASE_URL=https://coffee-point-api-317780828805.europe-west3.run.app
VITE_API_TIMEOUT=10000
VITE_ADMIN_MODE=true
VITE_DEBUG_MODE=false
VITE_ENABLE_LOGGING=true
EOF
    log_success ".env.production создан для production режима"
}

# Проверка зависимостей
check_dependencies() {
    log "Проверка зависимостей..."
    
    if ! command -v node &> /dev/null; then
        log_error "Node.js не установлен"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        log_error "npm не установлен"
        exit 1
    fi
    
    if [ ! -f "package.json" ]; then
        log_error "package.json не найден. Запустите скрипт из корня проекта"
        exit 1
    fi
    
    log_success "Зависимости проверены"
}

# Установка зависимостей если нужно
install_deps() {
    if [ ! -d "node_modules" ]; then
        log "Установка зависимостей..."
        npm install
        log_success "Зависимости установлены"
    fi
}

# Функции запуска
run_local() {
    log "🚀 Запуск в ЛОКАЛЬНОМ режиме..."
    log "API будет проксироваться на http://0.0.0.0:8080"
    
    create_local_env
    
    log "Режим: LOCAL | Прокси: ВКЛЮЧЕН | API: localhost:8080"
    log "Запуск development сервера..."
    npm run dev
}

run_prod() {
    log "🚀 Запуск в PRODUCTION режиме..."
    log "API запросы будут проксироваться на production сервер через Vite"
    
    create_prod_env
    
    log "Сборка приложения..."
    npm run build
    
    log "Режим: PRODUCTION | Прокси: ВКЛЮЧЕН | API: production URL через прокси"
    log "Запуск preview сервера..."
    npm run preview
}

run_dev() {
    log "🚀 Запуск development сервера..."
    npm run dev
}

run_preview() {
    log "🚀 Запуск preview сервера..."
    
    if [ ! -d "dist" ]; then
        log "Сборка не найдена. Выполняю сборку..."
        npm run build
    fi
    
    npm run preview
}

run_build() {
    log "🏗️ Сборка приложения..."
    npm run build
    log_success "Сборка завершена. Файлы находятся в папке dist/"
}

# Основная логика
main() {
    echo "☕ Coffee Shop Web App Runner"
    echo "================================"
    
    # Проверяем аргументы
    if [ $# -eq 0 ]; then
        log_error "Не указан режим запуска"
        show_help
        exit 1
    fi
    
    MODE=$1
    
    # Проверяем зависимости
    check_dependencies
    install_deps
    
    # Логируем информацию о системе
    log "Node.js версия: $(node --version)"
    log "npm версия: $(npm --version)"
    log "Операционная система: $(uname -s)"
    log "Текущая директория: $(pwd)"
    log "Выбранный режим: $MODE"
    
    # Запускаем в зависимости от режима
    case $MODE in
        "local")
            run_local
            ;;
        "prod")
            run_prod
            ;;
        "dev")
            run_dev
            ;;
        "preview")
            run_preview
            ;;
        "build")
            run_build
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            log_error "Неизвестный режим: $MODE"
            show_help
            exit 1
            ;;
    esac
}

# Запуск основной функции
main "$@" 