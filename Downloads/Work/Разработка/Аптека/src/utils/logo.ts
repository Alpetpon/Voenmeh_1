// Утилиты для работы с логотипами

import { LOGO_VERSIONS, LogoType, LogoVariant, LogoFormat } from '@/constants/logos';

/**
 * Получить логотип для header (прозрачный фирменный знак)
 */
export const getHeaderLogo = (): string => {
  return getLogoVersion('brandMark', 'transparent', 'svg');
};

/**
 * Получить логотип для footer (основная версия)
 */
export const getFooterLogo = (): string => {
  return LOGO_VERSIONS.main;
};

/**
 * Получить горизонтальный прозрачный логотип для hero
 */
export const getHeroLogo = (): string => {
  return '/assets/images/logos/horizontal-transparent.png';
};

/**
 * Получить конкретную версию логотипа
 */
export const getLogoVersion = (
  type: LogoType,
  variant: LogoVariant,
  format: LogoFormat = 'svg'
): string => {
  const typeVersions = LOGO_VERSIONS.versions[type];
  
  if (variant === 'whiteBackground' && type === 'brandMark') {
    const brandMarkVersions = LOGO_VERSIONS.versions.brandMark;
    return brandMarkVersions.whiteBackground[format];
  }
  
  if (variant === 'blackWhite') {
    // Для ЧБ версии нужно указать конкретный цвет
    return typeVersions.blackWhite[`black${format.toUpperCase()}` as keyof typeof typeVersions.blackWhite] as string;
  }
  
  if (variant === 'color' || variant === 'transparent') {
    return typeVersions[variant][format];
  }
  
  // Fallback для других случаев
  return typeVersions.color[format];
};

/**
 * Получить логотип в зависимости от темы
 */
export const getThemeLogo = (
  type: LogoType = 'main',
  isDark: boolean = false,
  format: LogoFormat = 'svg'
): string => {
  if (isDark) {
    return getLogoVersion(type, 'blackWhite', format);
  }
  return getLogoVersion(type, 'color', format);
};

/**
 * Получить адаптивный логотип для разных размеров экрана
 */
export const getResponsiveLogo = (
  isMobile: boolean = false,
  format: LogoFormat = 'svg'
): string => {
  if (isMobile) {
    // На мобильных используем фирменный знак
    return getLogoVersion('brandMark', 'whiteBackground', format);
  }
  // На десктопе используем основную версию
  return getLogoVersion('main', 'color', format);
};

/**
 * Проверить, поддерживается ли формат
 */
export const isSupportedFormat = (format: string): format is LogoFormat => {
  return ['svg', 'png', 'eps'].includes(format);
};

/**
 * Получить все доступные варианты логотипа
 */
export const getAvailableLogos = () => {
  return {
    quick: {
      main: LOGO_VERSIONS.main,
      brandMarkWhite: LOGO_VERSIONS.brandMarkWhite,
      brandMarkWhitePng: LOGO_VERSIONS.brandMarkWhitePng,
    },
    complete: LOGO_VERSIONS.versions,
    logobook: LOGO_VERSIONS.logobook
  };
}; 