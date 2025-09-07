// Константы навигации

export const MAIN_NAVIGATION = [
  {
    label: 'Каталог',
    href: '/catalog',
    description: 'Каталог товаров'
  },
  {
    label: 'Аптеки',
    href: '/pharmacies',
    description: 'Наши аптеки'
  },
  {
    label: 'О нас',
    href: '/about',
    description: 'О компании'
  },
  {
    label: 'Контакты',
    href: '/contacts',
    description: 'Контактная информация'
  }
] as const;

export const FOOTER_LINKS = {
  company: [
    { label: 'О компании', href: '/about' },
    { label: 'Наши аптеки', href: '/pharmacies' },
    { label: 'Вакансии', href: '/careers' },
    { label: 'Новости', href: '/news' }
  ],
  services: [
    { label: 'Доставка', href: '/delivery' },
    { label: 'Консультации', href: '/consultations' },
    { label: 'Программа лояльности', href: '/loyalty' },
    { label: 'Онлайн-заказ', href: '/order' }
  ],
  support: [
    { label: 'Помощь', href: '/help' },
    { label: 'Контакты', href: '/contacts' },
    { label: 'Политика конфиденциальности', href: '/privacy' },
    { label: 'Пользовательское соглашение', href: '/terms' }
  ]
} as const; 