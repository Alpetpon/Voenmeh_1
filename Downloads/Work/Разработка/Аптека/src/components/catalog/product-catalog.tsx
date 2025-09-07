'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface Product {
  id: number;
  name: string;
  price: number;
  oldPrice?: number;
  brand?: string;
  inStock: boolean;
  images: string[];
  rating: number;
  reviewsCount: number;
  isDiscounted: boolean;
  category: {
    name: string;
  };
}

interface ProductCatalogProps {
  initialCategory?: string;
  className?: string;
}

export default function ProductCatalog({ initialCategory, className }: ProductCatalogProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const params = new URLSearchParams({ limit: '12' });
        if (initialCategory) params.append('category', initialCategory);

        const response = await fetch(`/api/products?${params}`);
        const data = await response.json();

        if (data.success) {
          setProducts(data.data.products);
        }
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [initialCategory]);

  if (loading) {
    return (
      <div className={cn('w-full', className)}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square bg-muted rounded-2xl mb-4" />
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2" />
                <div className="h-6 bg-muted rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('w-full', className)}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {initialCategory ? `Категория: ${initialCategory}` : 'Каталог товаров'}
        </h2>
        <p className="text-muted-foreground">
          {products.length} товаров найдено
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              'group relative bg-background border border-border/50 rounded-2xl overflow-hidden',
              'hover:border-primary/50 hover:shadow-lg transition-all duration-300'
            )}
          >
            {/* Изображение */}
            <div className="relative aspect-square overflow-hidden bg-muted">
              {product.images[0] ? (
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  Нет изображения
                </div>
              )}
              
              {/* Бейджи */}
              <div className="absolute top-3 left-3 flex flex-col gap-2">
                {product.isDiscounted && (
                  <span className="px-2 py-1 bg-destructive text-destructive-foreground text-xs font-medium rounded-full">
                    Скидка
                  </span>
                )}
                {!product.inStock && (
                  <span className="px-2 py-1 bg-muted text-muted-foreground text-xs font-medium rounded-full">
                    Нет в наличии
                  </span>
                )}
              </div>
            </div>

            {/* Контент */}
            <div className="p-4">
              <div className="space-y-2">
                {/* Категория и бренд */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{product.category.name}</span>
                  {product.brand && (
                    <>
                      <span>•</span>
                      <span>{product.brand}</span>
                    </>
                  )}
                </div>

                {/* Название */}
                <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                  {product.name}
                </h3>

                {/* Рейтинг */}
                {product.rating > 0 && (
                  <div className="flex items-center gap-1">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            'h-3 w-3',
                            i < Math.floor(product.rating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-muted-foreground'
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      ({product.reviewsCount})
                    </span>
                  </div>
                )}

                {/* Цена */}
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-primary">
                    {product.price.toLocaleString('ru-RU')} ₽
                  </span>
                  {product.oldPrice && (
                    <span className="text-sm text-muted-foreground line-through">
                      {product.oldPrice.toLocaleString('ru-RU')} ₽
                    </span>
                  )}
                </div>

                {/* Кнопка добавления в корзину */}
                <Button 
                  className="w-full mt-3" 
                  disabled={!product.inStock}
                  variant={product.inStock ? 'default' : 'outline'}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {product.inStock ? 'В корзину' : 'Нет в наличии'}
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {products.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Товары не найдены</p>
        </div>
      )}
    </div>
  );
} 