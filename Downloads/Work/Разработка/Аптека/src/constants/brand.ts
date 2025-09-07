// Константы бренда ЭкоЛайф

export const BRAND_COLORS = {
  green: '#01735c',
  brown: '#544740', 
  blue: '#63b2d1',
  white: '#ffffff',
  black: '#000000',
} as const;

export const BRAND_NAME = 'ЭкоЛайф' as const;

export const BRAND_DESCRIPTION = 'Аптечная сеть' as const;

export const BRAND_TAGLINE = 'Здоровье и качество жизни' as const;

export const CONTACT_INFO = {
  phone: '8 800 555-35-35',
  email: 'info@ecolife.ru',
  website: 'www.ecolife.ru',
} as const;

export const ASSETS_PATHS = {
  logos: {
    main: '/assets/images/logos/logo.svg',
    transparent: '/assets/images/logos/logo-transparent.svg',
    png: '/assets/images/logos/logo-transparent.png',
    eps: '/assets/images/logos/logo-transparent.eps',
    brandMarkWhite: '/assets/images/logos/brand-mark-white.svg',
    brandMarkWhitePng: '/assets/images/logos/brand-mark-white.png',
    horizontalTransparent: '/assets/images/logos/horizontal-transparent.png',
  },
  fonts: {
    vezitsa: '/assets/fonts/vezitsa-cyrillic.ttf',
  },
} as const;

export const PHARMACY_STATS = {
  pharmacies: '50+',
  workingHours: '24/7',
  rating: 4.9,
  clients: '247+',
} as const; 