'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Clock, Navigation, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface Store {
  id: number;
  name: string;
  address: string;
  city: string;
  phone?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  workingHours: any;
  services: string[];
  hasParking: boolean;
  is24h: boolean;
  distance?: number;
}

interface StoresMapProps {
  className?: string;
  initialCity?: string;
}

export default function StoresMap({ className, initialCity }: StoresMapProps) {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setSelectedStore] = useState<Store | null>(null);
  const [searchCity, setSearchCity] = useState(initialCity || '');

  // Загрузка аптек
  const loadStores = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchCity) params.append('city', searchCity);

      const response = await fetch(`/api/stores?${params}`);
      const data = await response.json();

      if (data.success) {
        setStores(data.data.stores);
      }
    } catch (error) {
      console.error('Error loading stores:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStores();
  }, [searchCity]);

  const formatWorkingHours = (workingHours: any) => {
    if (!workingHours) return 'Не указано';
    return 'Пн-Пт: 9:00-21:00, Сб-Вс: 10:00-20:00';
  };

  return (
    <div className={cn('w-full', className)}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-4">Наши аптеки</h2>
        
        {/* Поиск */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Поиск по городу..."
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-muted rounded-2xl mb-4" />
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store) => (
            <motion.div
              key={store.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'p-6 border border-border rounded-2xl bg-background',
                'hover:border-primary/50 hover:shadow-lg transition-all duration-300',
                'cursor-pointer'
              )}
              onClick={() => setSelectedStore(store)}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-foreground text-lg">{store.name}</h3>
                  {store.is24h && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      24/7
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>{store.address}</span>
                  </div>

                  {store.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4 flex-shrink-0" />
                      <a href={`tel:${store.phone}`} className="text-primary hover:underline">
                        {store.phone}
                      </a>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 flex-shrink-0" />
                    <span>{store.is24h ? 'Круглосуточно' : formatWorkingHours(store.workingHours)}</span>
                  </div>
                </div>

                {store.services.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">Услуги:</p>
                    <div className="flex flex-wrap gap-1">
                      {store.services.slice(0, 3).map((service) => (
                        <span
                          key={service}
                          className="px-2 py-1 bg-primary/10 text-primary text-xs rounded"
                        >
                          {service}
                        </span>
                      ))}
                      {store.services.length > 3 && (
                        <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded">
                          +{store.services.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {store.distance && (
                  <div className="text-sm text-primary font-medium">
                    {store.distance.toFixed(1)} км от вас
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button size="sm" className="flex-1">
                    Записаться
                  </Button>
                  <Button variant="outline" size="sm">
                    <Navigation className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {stores.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Аптеки не найдены</p>
        </div>
      )}

      {/* Заглушка для интерактивной карты */}
      <div className="mt-8 p-8 border border-border rounded-2xl bg-muted/20 text-center">
        <h3 className="text-lg font-semibold text-foreground mb-2">Интерактивная карта</h3>
        <p className="text-muted-foreground mb-4">
          Здесь будет размещена интерактивная карта с Yandex Maps API
        </p>
        <Button variant="outline">
          Открыть карту
        </Button>
      </div>
    </div>
  );
} 