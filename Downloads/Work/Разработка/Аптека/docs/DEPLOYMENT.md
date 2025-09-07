# 🚀 Руководство по развертыванию ЭкоЛайф

## Предварительные требования

### Системные требования
- **Node.js**: версия 20.0.0 или выше
- **npm**: версия 9.0.0 или выше
- **PostgreSQL**: версия 14 или выше

### Установка зависимостей системы

#### macOS
```bash
# Установка Node.js через Homebrew
brew install node

# Установка PostgreSQL
brew install postgresql
brew services start postgresql
```

#### Ubuntu/Debian
```bash
# Установка Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Установка PostgreSQL
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

## Настройка базы данных

### 1. Создание базы данных
```bash
# Подключение к PostgreSQL
sudo -u postgres psql

# Создание базы данных и пользователя
CREATE DATABASE ecolife_pharmacy;
CREATE USER ecolife_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE ecolife_pharmacy TO ecolife_user;
\q
```

### 2. Настройка переменных окружения
Создайте файл `.env.local` в корне проекта:

```env
# База данных PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ecolife_pharmacy
DB_USER=ecolife_user
DB_PASSWORD=your_secure_password

# JWT секретный ключ (сгенерируйте надежный ключ)
JWT_SECRET=your-super-secret-jwt-key-change-in-production-please
JWT_EXPIRES_IN=7d

# Yandex Maps API ключ (получите на https://developer.tech.yandex.ru/)
YANDEX_MAPS_API_KEY=your-yandex-maps-api-key

# Email настройки (для уведомлений)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# URL приложения
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Режим разработки
NODE_ENV=development
```

## Установка и запуск

### 1. Клонирование и установка зависимостей
```bash
# Переход в директорию проекта
cd /path/to/your/project

# Установка зависимостей
npm install
```

### 2. Инициализация базы данных
```bash
# Создание таблиц и добавление тестовых данных
npm run db:init
```

### 3. Запуск в режиме разработки
```bash
# Запуск сервера разработки
npm run dev
```

Приложение будет доступно по адресу: http://localhost:3000

### 4. Проверка типов TypeScript
```bash
# Проверка типов без компиляции
npm run type-check
```

### 5. Линтинг и форматирование
```bash
# Проверка кода
npm run lint

# Автоматическое исправление ошибок
npm run lint:fix

# Форматирование кода
npm run format
```

## Продакшн развертывание

### 1. Сборка проекта
```bash
# Создание продакшн сборки
npm run build
```

### 2. Запуск продакшн сервера
```bash
# Запуск оптимизированного сервера
npm start
```

### 3. Развертывание на Vercel (рекомендуется)

#### Через Vercel CLI
```bash
# Установка Vercel CLI
npm i -g vercel

# Развертывание
vercel

# Настройка переменных окружения
vercel env add DB_HOST
vercel env add DB_USER
vercel env add DB_PASSWORD
# ... добавьте все необходимые переменные
```

#### Через GitHub интеграцию
1. Подключите репозиторий к Vercel
2. Настройте переменные окружения в панели Vercel
3. Автоматическое развертывание при push в main ветку

### 4. Настройка базы данных для продакшна

#### Использование Vercel Postgres
```bash
# Создание Postgres базы в Vercel
vercel postgres create
```

#### Использование внешнего провайдера (Supabase, PlanetScale, etc.)
Обновите переменные окружения с данными подключения к продакшн базе.

## Мониторинг и логирование

### 1. Настройка логирования
Логи автоматически собираются в:
- Консоль браузера (клиентские ошибки)
- Серверные логи Next.js
- Логи базы данных PostgreSQL

### 2. Мониторинг производительности
- Core Web Vitals отслеживаются автоматически
- Используйте Vercel Analytics для детальной аналитики
- Настройте Sentry для отслеживания ошибок

## Безопасность

### 1. Переменные окружения
- Никогда не коммитьте `.env.local` в репозиторий
- Используйте надежные пароли и ключи
- Регулярно обновляйте JWT секреты

### 2. База данных
- Используйте SSL соединения в продакшне
- Настройте регулярные бэкапы
- Ограничьте доступ к базе данных

### 3. API безопасность
- Все API маршруты защищены от CSRF
- Валидация входных данных
- Rate limiting (рекомендуется добавить)

## Обслуживание

### 1. Обновление зависимостей
```bash
# Проверка устаревших пакетов
npm outdated

# Обновление зависимостей
npm update

# Аудит безопасности
npm audit
npm audit fix
```

### 2. Бэкап базы данных
```bash
# Создание бэкапа
pg_dump -h localhost -U ecolife_user ecolife_pharmacy > backup.sql

# Восстановление из бэкапа
psql -h localhost -U ecolife_user ecolife_pharmacy < backup.sql
```

### 3. Мониторинг производительности
- Отслеживайте время загрузки страниц
- Мониторьте использование памяти и CPU
- Проверяйте логи на наличие ошибок

## Устранение неполадок

### Частые проблемы

#### 1. Ошибка подключения к базе данных
```bash
# Проверка статуса PostgreSQL
sudo systemctl status postgresql

# Перезапуск службы
sudo systemctl restart postgresql
```

#### 2. Ошибки TypeScript
```bash
# Очистка кэша TypeScript
rm -rf .next
npm run type-check
```

#### 3. Проблемы с зависимостями
```bash
# Очистка node_modules и переустановка
rm -rf node_modules package-lock.json
npm install
```

## Контакты и поддержка

При возникновении проблем:
1. Проверьте логи приложения
2. Убедитесь в правильности переменных окружения
3. Проверьте статус всех сервисов
4. Обратитесь к документации Next.js и PostgreSQL

---

**Важно**: Данное руководство предполагает базовые знания работы с Node.js, PostgreSQL и системами развертывания. Для продакшн использования рекомендуется дополнительная настройка безопасности и мониторинга. 