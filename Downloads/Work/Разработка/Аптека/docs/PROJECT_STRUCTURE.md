# Структура проекта ЭкоЛайф

## Обзор

Проект организован по принципу модульности и переиспользования кода. Все ресурсы и компоненты логически разделены по папкам.

## Структура папок

```
├── docs/                          # Документация проекта
│   ├── PROJECT_STRUCTURE.md       # Описание структуры
│   ├── DEPLOYMENT.md              # Инструкции по развертыванию
│   └── ТЗ_ЭкоЛайф.docx           # Техническое задание
│
├── public/                        # Статические файлы
│   └── assets/                    # Организованные ресурсы
│       ├── images/                # Изображения
│       │   ├── logos/             # Логотипы компании
│       │   │   ├── logo.svg       # Основной логотип
│       │   │   ├── logo-transparent.svg
│       │   │   ├── logo-transparent.png
│       │   │   └── logo-transparent.eps
│       │   └── icons/             # Иконки
│       └── fonts/                 # Шрифты
│           └── vezitsa-cyrillic.ttf
│
├── src/                           # Исходный код
│   ├── app/                       # Next.js App Router
│   │   ├── api/                   # API маршруты
│   │   ├── globals.css            # Глобальные стили
│   │   ├── layout.tsx             # Корневой layout
│   │   └── page.tsx               # Главная страница
│   │
│   ├── components/                # React компоненты
│   │   ├── layout/                # Компоненты макета
│   │   │   ├── header.tsx         # Шапка сайта
│   │   │   └── footer.tsx         # Подвал сайта
│   │   ├── sections/              # Секции страниц
│   │   │   ├── hero-section.tsx   # Главная секция
│   │   │   ├── benefits-section.tsx
│   │   │   └── ...
│   │   ├── ui/                    # UI компоненты
│   │   │   ├── button.tsx         # Кнопки
│   │   │   ├── badge.tsx          # Бейджи
│   │   │   └── ...
│   │   └── providers/             # Провайдеры контекста
│   │
│   ├── constants/                 # Константы приложения
│   │   ├── brand.ts               # Брендинг и цвета
│   │   ├── navigation.ts          # Навигация
│   │   └── index.ts               # Экспорты
│   │
│   ├── utils/                     # Утилиты
│   │   ├── assets.ts              # Работа с ресурсами
│   │   └── index.ts               # Экспорты
│   │
│   ├── hooks/                     # Пользовательские хуки
│   ├── lib/                       # Библиотеки и конфигурации
│   └── types/                     # TypeScript типы
│
└── scripts/                       # Скрипты сборки и развертывания
```

## Принципы организации

### 1. Assets (Ресурсы)
- **Логотипы**: Все варианты логотипов в `/public/assets/images/logos/`
- **Шрифты**: Кастомные шрифты в `/public/assets/fonts/`
- **Изображения**: Организованы по типам в `/public/assets/images/`

### 2. Константы
- **Брендинг**: Цвета, названия, контакты в `src/constants/brand.ts`
- **Навигация**: Меню и ссылки в `src/constants/navigation.ts`

### 3. Утилиты
- **Assets**: Функции для работы с ресурсами в `src/utils/assets.ts`

### 4. Компоненты
- **Layout**: Компоненты макета (header, footer)
- **Sections**: Секции страниц
- **UI**: Переиспользуемые UI компоненты

## Использование

### Импорт констант
```typescript
import { BRAND_NAME, BRAND_COLORS } from '@/constants/brand';
import { MAIN_NAVIGATION } from '@/constants/navigation';
```

### Работа с ресурсами
```typescript
import { getLogoPath } from '@/utils/assets';

const logoSrc = getLogoPath('main'); // '/assets/images/logos/logo.svg'
```

### Компоненты
```typescript
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
```

## Преимущества структуры

1. **Централизованное управление**: Все константы в одном месте
2. **Переиспользование**: Утилиты и компоненты легко переиспользовать
3. **Типизация**: TypeScript обеспечивает безопасность типов
4. **Масштабируемость**: Легко добавлять новые компоненты и утилиты
5. **Поддержка**: Понятная структура для команды разработчиков 