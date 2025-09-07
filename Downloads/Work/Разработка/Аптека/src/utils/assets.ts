// Утилиты для работы с assets

import { ASSETS_PATHS } from '@/constants/brand';

/**
 * Получить путь к логотипу
 */
export const getLogoPath = (variant: 'main' | 'transparent' | 'png' | 'eps' | 'brandMarkWhite' | 'brandMarkWhitePng' | 'horizontalTransparent' = 'main'): string => {
  return ASSETS_PATHS.logos[variant];
};

/**
 * Получить путь к шрифту
 */
export const getFontPath = (font: 'vezitsa'): string => {
  return ASSETS_PATHS.fonts[font];
};

/**
 * Получить полный URL для asset
 */
export const getAssetUrl = (path: string): string => {
  return process.env.NODE_ENV === 'production' 
    ? `${process.env.NEXT_PUBLIC_SITE_URL || ''}${path}`
    : path;
};

/**
 * Проверить доступность изображения
 */
export const isImageValid = async (src: string): Promise<boolean> => {
  try {
    const response = await fetch(src, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}; 