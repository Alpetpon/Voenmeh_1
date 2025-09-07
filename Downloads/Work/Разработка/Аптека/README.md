# 🌿 ЭкоЛайф - Аптечная сеть

<div align="center">
  <img src="./public/transparent logo svg.svg" alt="ЭкоЛайф" width="120" height="120">
  <h3>Здоровье и качество жизни</h3>
  <p>Современная аптечная сеть с инновационным подходом к здравоохранению</p>
</div>

## 🎯 О проекте

**ЭкоЛайф** — это production-ready веб-приложение аптечной сети, созданное с использованием современных технологий и трендов UX/UI 2025 года. Проект представляет собой адаптивный сайт-витрину с функциями каталога товаров, поиска аптек, онлайн-записи к фармацевту и интегрированной системой управления контентом.

### ✨ Ключевые особенности

- 🎨 **Дизайн 2025** - Liquid Glass UI, Bento Grid, микро-анимации
- 🚀 **Производительность** - Core Web Vitals ≥90, SSR/ISR оптимизация
- 📱 **Адаптивность** - Поддержка устройств от 320px
- ♿ **Доступность** - WCAG AA+ совместимость
- 🌙 **Темы** - Автоматическое переключение светлой/темной темы
- 🔍 **Поиск** - Полнотекстовый поиск с автодополнением
- 🗺️ **Карты** - Интеграция с Яндекс.Картами
- 📧 **Уведомления** - Email-рассылка через Nodemailer

## 🛠 Технологический стек

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.5+
- **Styling**: Tailwind CSS 3.4+
- **UI Components**: Radix UI + shadcn/ui
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Data Fetching**: SWR
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js 5
- **Database**: PostgreSQL 15
- **ORM**: TypeORM
- **Email**: Nodemailer

### DevOps & Tools
- **Package Manager**: npm/yarn
- **Linting**: ESLint + Prettier
- **Testing**: Jest + Testing Library
- **Documentation**: Storybook
- **CI/CD**: GitHub Actions
- **Deployment**: Vercel

## 🚀 Быстрый старт

### Предварительные требования

- Node.js 20.0.0+
- npm 9.0.0+ или yarn
- PostgreSQL 15+ (для backend)

### Установка

```bash
# Клонирование репозитория
git clone https://github.com/your-username/ecolife.git
cd ecolife

# Установка зависимостей
npm install

# Копирование файла окружения
cp .env.example .env.local

# Запуск в режиме разработки
npm run dev
```

### Переменные окружения

Создайте файл `.env.local` в корне проекта:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/ecolife"

# API Keys
NEXT_PUBLIC_YANDEX_MAPS_API_KEY="your_yandex_maps_key"

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your_email@gmail.com"
SMTP_PASS="your_app_password"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_nextauth_secret"
```

## 📁 Структура проекта

```
ecolife/
├── public/                 # Статические файлы
│   ├── images/            # Изображения
│   │   ├── icons/             # Иконки и фавиконы
│   │   └── logos/             # Логотипы
│   ├── src/
│   │   ├── app/               # Next.js App Router
│   │   │   ├── (pages)/       # Группированные страницы
│   │   │   ├── api/           # API Routes
│   │   │   ├── globals.css    # Глобальные стили
│   │   │   ├── layout.tsx     # Корневой layout
│   │   │   └── page.tsx       # Главная страница
│   │   ├── components/        # React компоненты
│   │   │   ├── ui/            # UI компоненты
│   │   │   ├── forms/         # Формы
│   │   │   ├── layout/        # Layout компоненты
│   │   │   └── sections/      # Секции страниц
│   │   ├── hooks/             # Custom hooks
│   │   ├── lib/               # Утилиты и конфигурация
│   │   ├── stores/            # Zustand stores
│   │   ├── types/             # TypeScript типы
│   │   └── utils/             # Вспомогательные функции
│   ├── backend/               # Backend приложение
│   │   ├── src/
│   │   │   ├── entities/      # TypeORM сущности
│   │   │   ├── routes/        # Express маршруты
│   │   │   ├── services/      # Бизнес-логика
│   │   │   └── middleware/    # Middleware
│   ├── docs/                  # Документация
│   ├── tests/                 # Тесты
│   └── .storybook/           # Storybook конфигурация
```

## 🎨 Дизайн-система

### Цветовая палитра

```css
/* Основные цвета бренда */
--brand-brown: #544740    /* Коричневый */
--brand-green: #01735c    /* Зеленый */
--brand-blue: #63b2d1     /* Голубой */
--brand-white: #ffffff    /* Белый */
--brand-black: #000000    /* Черный */
```

### Шрифты

- **Основной**: Vezitsa (Variable Font)
- **Системный**: system-ui, sans-serif

### Компоненты

Все UI компоненты построены на основе:
- **Atomic Design** - методология организации компонентов
- **Radix UI** - примитивы для доступности
- **CVA** - варианты стилей компонентов
- **Tailwind CSS** - утилитарные классы

## 📱 Страницы и функционал

### Основные страницы

| Страница | Маршрут | Описание |
|----------|---------|-----------|
| Главная | `/` | Hero с Bento Grid, поиск, категории |
| О сети | `/about` | История, миссия, лицензии |
| Каталог | `/catalog` | Товары с фильтрами и поиском |
| Товар | `/catalog/[slug]` | Детальная страница товара |
| Аптеки | `/stores` | Карта аптек с поиском |
| Контакты | `/contacts` | Форма обратной связи, запись |

### Функции

- ✅ **Поиск товаров** с автодополнением
- ✅ **Фильтрация** по категориям, брендам, цене
- ✅ **Карта аптек** с кластеризацией
- ✅ **Онлайн-запись** к фармацевту
- ✅ **Обратная связь** с email уведомлениями
- ✅ **Адаптивный дизайн** для всех устройств
- ✅ **Темная тема** с автопереключением
- ✅ **SEO оптимизация** с мета-тегами

## 🧪 Тестирование

```bash
# Запуск всех тестов
npm run test

# Тесты в watch режиме
npm run test:watch

# Покрытие кода
npm run test:coverage

# E2E тесты
npm run test:e2e
```

## 📖 Документация

```bash
# Запуск Storybook
npm run storybook

# Сборка документации
npm run build-storybook
```

## 🚀 Деплой

### Vercel (рекомендуемый)

```bash
# Установка Vercel CLI
npm i -g vercel

# Деплой
vercel --prod
```

### Docker

```bash
# Сборка образа
docker build -t ecolife .

# Запуск контейнера
docker run -p 3000:3000 ecolife
```

## 🤝 Участие в разработке

1. Fork проекта
2. Создайте feature branch (`git checkout -b feature/amazing-feature`)
3. Commit изменения (`git commit -m 'Add amazing feature'`)
4. Push в branch (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

### Соглашения

- **Commits**: Conventional Commits
- **Code Style**: ESLint + Prettier
- **Components**: Atomic Design + Storybook
- **Types**: Строгая типизация TypeScript

## 📋 Roadmap

### Phase 1 (Current)
- [x] Основная архитектура
- [x] UI компоненты
- [x] Главная страница
- [ ] Каталог товаров
- [ ] Карта аптек

### Phase 2
- [ ] Корзина покупок
- [ ] Личный кабинет
- [ ] Система заказов
- [ ] Интеграция с платежами

### Phase 3
- [ ] Мобильное приложение
- [ ] Progressive Web App
- [ ] AI-рекомендации
- [ ] Голосовой поиск

## 📄 Лицензия

Этот проект распространяется под лицензией MIT. См. файл `LICENSE` для подробностей.

## 👥 Команда

- **Frontend Developer** - [Ваше имя](https://github.com/yourusername)
- **UI/UX Designer** - [Имя дизайнера](https://github.com/designer)
- **Backend Developer** - [Имя разработчика](https://github.com/backend-dev)

## 📞 Поддержка

- 📧 Email: support@ecolife.ru
- 💬 Telegram: [@ecolife_support](https://t.me/ecolife_support)
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/ecolife/issues)

---

<div align="center">
  <p>Создано с ❤️ для здоровья и качества жизни</p>
  <p>© 2024 ЭкоЛайф. Все права защищены.</p>
</div> 