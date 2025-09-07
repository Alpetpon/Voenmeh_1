import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Логотип и описание */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-white font-bold text-lg">Э</span>
              </div>
              <span className="font-bold text-xl text-primary">ЭкоЛайф</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Аптечная сеть ЭкоЛайф - здоровье и качество жизни. 
              Широкий ассортимент лекарственных препаратов и товаров для здоровья.
            </p>
          </div>

          {/* Каталог */}
          <div className="space-y-4">
            <h3 className="font-semibold">Каталог</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/catalog/medicines" className="text-muted-foreground hover:text-primary transition-colors">
                  Лекарственные препараты
                </Link>
              </li>
              <li>
                <Link href="/catalog/vitamins" className="text-muted-foreground hover:text-primary transition-colors">
                  Витамины и БАДы
                </Link>
              </li>
              <li>
                <Link href="/catalog/cosmetics" className="text-muted-foreground hover:text-primary transition-colors">
                  Косметика и гигиена
                </Link>
              </li>
              <li>
                <Link href="/catalog/medical-devices" className="text-muted-foreground hover:text-primary transition-colors">
                  Медицинские изделия
                </Link>
              </li>
            </ul>
          </div>

          {/* Информация */}
          <div className="space-y-4">
            <h3 className="font-semibold">Информация</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">
                  О компании
                </Link>
              </li>
              <li>
                <Link href="/stores" className="text-muted-foreground hover:text-primary transition-colors">
                  Наши аптеки
                </Link>
              </li>
              <li>
                <Link href="/delivery" className="text-muted-foreground hover:text-primary transition-colors">
                  Доставка
                </Link>
              </li>
              <li>
                <Link href="/contacts" className="text-muted-foreground hover:text-primary transition-colors">
                  Контакты
                </Link>
              </li>
            </ul>
          </div>

          {/* Контакты */}
          <div className="space-y-4">
            <h3 className="font-semibold">Контакты</h3>
            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground">
                <strong>Телефон:</strong><br />
                8 (800) 123-45-67
              </p>
              <p className="text-muted-foreground">
                <strong>Email:</strong><br />
                info@ecolife.ru
              </p>
              <p className="text-muted-foreground">
                <strong>Режим работы:</strong><br />
                Ежедневно с 8:00 до 22:00
              </p>
            </div>
          </div>
        </div>

        {/* Нижняя часть */}
        <div className="mt-8 pt-8 border-t flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © 2024 ЭкоЛайф. Все права защищены.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Политика конфиденциальности
            </Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Условия использования
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
} 