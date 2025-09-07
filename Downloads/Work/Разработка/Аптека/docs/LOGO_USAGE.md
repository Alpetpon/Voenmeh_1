# Руководство по использованию логотипов ЭкоЛайф

## Обзор

В проекте ЭкоЛайф доступны все официальные версии логотипов в различных форматах и вариантах. Логотипы организованы в структурированную систему для удобного использования.

## Структура логотипов

### Быстрый доступ
```typescript
import { getHeaderLogo, getFooterLogo } from '@/utils';

// Для header (фирменный знак на белом фоне)
const headerLogo = getHeaderLogo();

// Для footer (основная версия)
const footerLogo = getFooterLogo();
```

### Полная коллекция
```typescript
import { LOGO_VERSIONS } from '@/constants';

// Основные логотипы
LOGO_VERSIONS.main                    // Основной логотип
LOGO_VERSIONS.brandMarkWhite          // Фирменный знак на белом фоне (SVG)
LOGO_VERSIONS.brandMarkWhitePng       // Фирменный знак на белом фоне (PNG)
```

## Типы логотипов

### 1. Основная версия (`main`)
- **Цветная версия**: полный логотип с названием в фирменных цветах
- **Черно-белая**: для печати и монохромных применений
- **Прозрачный фон**: для наложения на различные фоны

### 2. Фирменный знак (`brandMark`)
- **Цветная версия**: только символ без текста
- **Черно-белая**: монохромная версия символа
- **Прозрачный фон**: символ для наложения
- **Белый фон**: символ на белом фоне (используется в header)

### 3. Вертикальная версия (`vertical`)
- Логотип с вертикальным расположением элементов
- Подходит для узких пространств

### 4. Горизонтальная версия (`horizontal`)
- Логотип с горизонтальным расположением
- Подходит для широких пространств

## Утилиты для работы с логотипами

### getLogoVersion()
```typescript
import { getLogoVersion } from '@/utils';

// Получить конкретную версию
const logo = getLogoVersion('brandMark', 'whiteBackground', 'svg');
```

### getThemeLogo()
```typescript
import { getThemeLogo } from '@/utils';

// Логотип в зависимости от темы
const logo = getThemeLogo('main', isDark, 'svg');
```

### getResponsiveLogo()
```typescript
import { getResponsiveLogo } from '@/utils';

// Адаптивный логотип
const logo = getResponsiveLogo(isMobile, 'svg');
```

## Рекомендации по использованию

### Header
- **Используйте**: фирменный знак на белом фоне
- **Размер**: 48x48px (w-12 h-12)
- **Контейнер**: белый фон с тенью и рамкой

```tsx
<Image
  src={getHeaderLogo()}
  alt="ЭкоЛайф фирменный знак"
  width={48}
  height={48}
  className="w-12 h-12"
  priority
  unoptimized
/>
```

### Hero секция
- **Используйте**: горизонтальный прозрачный логотип
- **Размер**: адаптивный (w-64 sm:w-80)
- **Формат**: PNG для лучшего качества

```tsx
<Image
  src="/assets/images/logos/horizontal-transparent.png"
  alt="ЭкоЛайф - Аптечная сеть"
  width={320}
  height={120}
  className="w-64 sm:w-80 h-auto max-w-full"
  priority
/>
```

### Footer
- **Используйте**: основную версию логотипа
- **Размер**: больший размер для лучшей читаемости

### Мобильные устройства
- **Используйте**: фирменный знак (компактнее)
- **Адаптация**: автоматическая через `getResponsiveLogo()`

### Печать
- **Используйте**: черно-белые версии
- **Формат**: EPS для векторной печати, PNG для растровой

## Форматы файлов

- **SVG**: векторный формат, рекомендуется для веба
- **PNG**: растровый формат, для случаев когда SVG не подходит
- **EPS**: векторный формат для печати

## Цветовая схема

Логотипы используют фирменные цвета ЭкоЛайф:
- **Основной зеленый**: #01735c
- **Коричневый**: #544740
- **Голубой**: #63b2d1
- **Белый**: #ffffff
- **Черный**: #000000

## Примеры использования

### В компонентах
```tsx
import { getHeaderLogo, getLogoVersion } from '@/utils';

// Header
<Image src={getHeaderLogo()} alt="ЭкоЛайф" />

// Карточка товара (маленький логотип)
<Image src={getLogoVersion('brandMark', 'transparent', 'svg')} alt="ЭкоЛайф" />

// Footer (полный логотип)
<Image src={getLogoVersion('main', 'color', 'svg')} alt="ЭкоЛайф" />
```

### Условное использование
```tsx
const logoSrc = useMemo(() => {
  if (isMobile) {
    return getResponsiveLogo(true);
  }
  if (isDarkTheme) {
    return getThemeLogo('main', true);
  }
  return getHeaderLogo();
}, [isMobile, isDarkTheme]);
```

## Файловая структура

```
public/assets/images/logos/
├── logo.svg                           # Основной логотип (быстрый доступ)
├── brand-mark-white.svg               # Фирменный знак на белом фоне
├── brand-mark-white.png               # Фирменный знак PNG
├── horizontal-transparent.png         # Горизонтальный прозрачный (hero)
├── Logobook ЭкоЛайф.pdf              # Фирменная книга
└── versions/                          # Полная коллекция
    ├── main/                          # Основная версия
    │   ├── Цвет/
    │   ├── ЧБ/
    │   └── Прозрачный фон/
    ├── brand-mark/                    # Фирменный знак
    │   ├── Цвет/
    │   ├── ЧБ/
    │   ├── Прозрачный фон/
    │   └── Белый фон/
    ├── vertical/                      # Вертикальная версия
    └── horizontal/                    # Горизонтальная версия
```

## Фирменная книга

Полное руководство по использованию логотипов доступно в файле:
`/assets/images/logos/Logobook ЭкоЛайф.pdf` 