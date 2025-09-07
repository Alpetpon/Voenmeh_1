'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import SearchBar from '@/components/search/search-bar';
import { BRAND_NAME } from '@/constants/brand';
import { MAIN_NAVIGATION } from '@/constants/navigation';
import { getHeaderLogo } from '@/utils';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-brand-brown/20 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 shadow-sm">
      <div className="container flex h-20 items-center justify-between">
        {/* Фирменный знак */}
        <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
          <Image
            src={getHeaderLogo()}
            alt={`${BRAND_NAME} фирменный знак`}
            width={48}
            height={48}
            className="w-12 h-12"
            priority
            unoptimized
          />
          <span className="font-bold text-2xl text-brand-green font-vezitsa translate-y-1">{BRAND_NAME}</span>
        </Link>

        {/* Поиск */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <SearchBar />
        </div>

        {/* Навигация */}
        <nav className="hidden md:flex items-center space-x-8">
          {MAIN_NAVIGATION.map((item) => (
            <Link 
              key={item.href}
              href={item.href} 
              className="text-lg font-medium text-brand-brown hover:text-brand-green transition-colors font-vezitsa"
              title={item.description}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Кнопки действий */}
        <div className="flex items-center space-x-3">
          <Link href="/cart" className="flex items-center space-x-2 p-2 border border-brand-green rounded-full hover:bg-brand-green/5 transition-colors group">
            <div className="relative">
              <ShoppingCart className="w-6 h-6 text-brand-green" />
              <span className="absolute -top-1 -right-1 bg-brand-green text-white font-bold rounded-full w-4 h-4 text-center text-[10px]" style={{lineHeight: '17px'}}>
                0
              </span>
            </div>
            <span className="text-brand-green font-vezitsa text-lg hidden sm:block">
              Корзина
            </span>
          </Link>
          
          {/* Мобильное меню */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            ☰
          </Button>
        </div>
      </div>

      {/* Мобильное меню */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-brand-brown/20 bg-white shadow-lg">
          <div className="container py-6 space-y-6">
            <SearchBar />
            <nav className="flex flex-col space-y-4">
              {MAIN_NAVIGATION.map((item) => (
                <Link 
                  key={item.href}
                  href={item.href} 
                  className="text-lg font-medium text-brand-brown hover:text-brand-green transition-colors font-vezitsa"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
} 