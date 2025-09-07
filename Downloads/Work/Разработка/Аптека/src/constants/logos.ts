// Константы логотипов ЭкоЛайф

export const LOGO_VERSIONS = {
  // Быстрый доступ к основным логотипам
  main: '/assets/images/logos/logo.svg',
  brandMarkWhite: '/assets/images/logos/brand-mark-white.svg',
  brandMarkWhitePng: '/assets/images/logos/brand-mark-white.png',
  
  // Полная коллекция версий
  versions: {
    main: {
      color: {
        svg: '/assets/images/logos/versions/main/Цвет/color logo svg.svg',
        png: '/assets/images/logos/versions/main/Цвет/color logo png.png',
        eps: '/assets/images/logos/versions/main/Цвет/color logo eps.eps',
      },
      blackWhite: {
        blackSvg: '/assets/images/logos/versions/main/ЧБ/black logo svg.svg',
        blackPng: '/assets/images/logos/versions/main/ЧБ/black logo png.png',
        blackEps: '/assets/images/logos/versions/main/ЧБ/black logo png.eps',
        whitePng: '/assets/images/logos/versions/main/ЧБ/white logo png.png',
        whiteEps: '/assets/images/logos/versions/main/ЧБ/white logo eps.eps',
      },
      transparent: {
        svg: '/assets/images/logos/versions/main/Прозрачный фон/transparent logo svg.svg',
        png: '/assets/images/logos/versions/main/Прозрачный фон/transparent logo png.png',
        eps: '/assets/images/logos/versions/main/Прозрачный фон/transparent logo eps.eps',
      }
    },
    brandMark: {
      color: {
        svg: '/assets/images/logos/versions/brand-mark/Цвет/color sign svg.svg',
        png: '/assets/images/logos/versions/brand-mark/Цвет/color sign png.png',
        eps: '/assets/images/logos/versions/brand-mark/Цвет/color sign eps.eps',
      },
      blackWhite: {
        blackSvg: '/assets/images/logos/versions/brand-mark/ЧБ/black sign svg.svg',
        blackPng: '/assets/images/logos/versions/brand-mark/ЧБ/black sign png.png',
        blackEps: '/assets/images/logos/versions/brand-mark/ЧБ/black sign eps.eps',
        whitePng: '/assets/images/logos/versions/brand-mark/ЧБ/white sign png.png',
        whiteEps: '/assets/images/logos/versions/brand-mark/ЧБ/white sign eps.eps',
        whiteSvg: '/assets/images/logos/versions/brand-mark/ЧБ/white sign svg.svg',
      },
      transparent: {
        svg: '/assets/images/logos/versions/brand-mark/Прозрачный фон/transparent sign svg.svg',
        png: '/assets/images/logos/versions/brand-mark/Прозрачный фон/transparent sign png.png',
        eps: '/assets/images/logos/versions/brand-mark/Прозрачный фон/transparent sign eps.eps',
      },
      whiteBackground: {
        svg: '/assets/images/logos/versions/brand-mark/Белый фон/white sign svg.svg',
        png: '/assets/images/logos/versions/brand-mark/Белый фон/white sign png.png',
        eps: '/assets/images/logos/versions/brand-mark/Белый фон/white sign eps.eps',
      }
    },
    vertical: {
      color: {
        svg: '/assets/images/logos/versions/vertical/Цвет/color vertical svg.svg',
        png: '/assets/images/logos/versions/vertical/Цвет/color vertical png.png',
        eps: '/assets/images/logos/versions/vertical/Цвет/color vertical eps.eps',
      },
      blackWhite: {
        blackSvg: '/assets/images/logos/versions/vertical/ЧБ/black vertical svg.svg',
        blackPng: '/assets/images/logos/versions/vertical/ЧБ/black vertical png.png',
        blackEps: '/assets/images/logos/versions/vertical/ЧБ/black vertical eps.eps',
        whitePng: '/assets/images/logos/versions/vertical/ЧБ/white vertical png.png',
        whiteEps: '/assets/images/logos/versions/vertical/ЧБ/white vertical eps.eps',
        whiteSvg: '/assets/images/logos/versions/vertical/ЧБ/white vertical svg.svg',
      },
      transparent: {
        svg: '/assets/images/logos/versions/vertical/Прозрачный фон/transparent vertical svg.svg',
        png: '/assets/images/logos/versions/vertical/Прозрачный фон/transparent vertical png.png',
        eps: '/assets/images/logos/versions/vertical/Прозрачный фон/transparent vertical eps.eps',
      }
    },
    horizontal: {
      color: {
        svg: '/assets/images/logos/versions/horizontal/Цвет/color horizontal svg.svg',
        png: '/assets/images/logos/versions/horizontal/Цвет/color horizontal png.png',
        eps: '/assets/images/logos/versions/horizontal/Цвет/color horizontal eps.eps',
      },
      blackWhite: {
        blackSvg: '/assets/images/logos/versions/horizontal/ЧБ/black horizontal svg.svg',
        blackPng: '/assets/images/logos/versions/horizontal/ЧБ/black horizontal png.png',
        blackEps: '/assets/images/logos/versions/horizontal/ЧБ/black horizontal eps.eps',
        whitePng: '/assets/images/logos/versions/horizontal/ЧБ/white horizontal png.png',
        whiteEps: '/assets/images/logos/versions/horizontal/ЧБ/white horizontal eps.eps',
        whiteSvg: '/assets/images/logos/versions/horizontal/ЧБ/white horizontal svg.svg',
      },
      transparent: {
        svg: '/assets/images/logos/versions/horizontal/Прозрачный фон/transparent horizontal svg.svg',
        png: '/assets/images/logos/versions/horizontal/Прозрачный фон/transparent horizontal png.png',
        eps: '/assets/images/logos/versions/horizontal/Прозрачный фон/transparent horizontal eps.eps',
      }
    }
  },
  
  // Фирменная книга
  logobook: '/assets/images/logos/Logobook ЭкоЛайф.pdf'
} as const;

// Типы для удобного использования
export type LogoType = 'main' | 'brandMark' | 'vertical' | 'horizontal';
export type LogoVariant = 'color' | 'blackWhite' | 'transparent' | 'whiteBackground';
export type LogoFormat = 'svg' | 'png' | 'eps'; 