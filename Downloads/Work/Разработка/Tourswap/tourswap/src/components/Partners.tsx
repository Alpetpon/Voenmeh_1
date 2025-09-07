'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  SiAirbnb,
  SiExpedia,
  SiTripadvisor,
  SiGooglemaps,
  SiUber,
  SiWaze,
  SiYelp,
  SiFoursquare,
  SiOpenstreetmap,
  SiMapbox,
  SiHere,
  SiGarmin,
  SiStrava,
  SiAlltrails,
  SiKomoot,
  SiGeocaching,
  SiBoeing,
  SiAmericanairlines,
  SiDelta,
  SiUnitedairlines,
  SiSouthwestairlines,
  SiJetblue,
  SiS7Airlines,
} from 'react-icons/si';

export default function Partners() {
  const logos = [
    {
      icon: SiAirbnb,
      color: '#FF5A5F',
      name: 'Airbnb',
      description: 'Аренда уникальных мест для проживания по всему миру',
    },
    {
      icon: SiExpedia,
      color: '#00AAE4',
      name: 'Аэрофлот',
      description: 'Российская национальная авиакомпания',
      img: '/aeroflot.svg',
    },
    {
      icon: SiTripadvisor,
      color: '#00AA6C',
      name: 'TripAdvisor',
      description: 'Отзывы и рекомендации для путешественников',
    },
    {
      icon: SiGooglemaps,
      color: '#FF0000',
      name: 'Яндекс.Карты',
      description: 'Карты и навигация для путешествий',
      img: '/free-icon-yandex-6124986.png',
    },
    {
      icon: SiExpedia,
      color: '#003580',
      name: 'Booking',
      description: 'Бронирование отелей по всему миру',
      img: '/bookingcom-1.svg',
    },
    {
      icon: SiWaze,
      color: '#0088CC',
      name: 'Telegram',
      description: 'Мессенджер для общения в путешествиях',
      img: '/free-icon-telegram-2111646.png',
    },
    // Дополнительные логотипы на будущее
    {
      icon: SiYelp,
      color: '#FF1A1A',
      name: 'Yelp',
      description: 'Отзывы о ресторанах и местах',
    },
    {
      icon: SiFoursquare,
      color: '#F94877',
      name: 'Foursquare',
      description: 'Открытие новых мест в путешествиях',
    },
    {
      icon: SiOpenstreetmap,
      color: '#7EBC6F',
      name: 'OpenStreetMap',
      description: 'Открытые карты для навигации',
    },
    {
      icon: SiMapbox,
      color: '#000000',
      name: 'Mapbox',
      description: 'Картографические решения',
    },
    {
      icon: SiHere,
      color: '#00AFAA',
      name: 'HERE Maps',
      description: 'Карты и навигационные сервисы',
    },
    {
      icon: SiGarmin,
      color: '#000000',
      name: 'Garmin',
      description: 'GPS навигация и спортивные устройства',
    },
    {
      icon: SiStrava,
      color: '#FC4C02',
      name: 'Strava',
      description: 'Отслеживание активностей и маршрутов',
    },
    {
      icon: SiAlltrails,
      color: '#4CAF50',
      name: 'AllTrails',
      description: 'Тропы и маршруты для пеших прогулок',
    },
    {
      icon: SiKomoot,
      color: '#6AA127',
      name: 'Komoot',
      description: 'Планирование велосипедных и пеших маршрутов',
    },
    {
      icon: SiGeocaching,
      color: '#4A90E2',
      name: 'Geocaching',
      description: 'Поиск сокровищ и приключения',
    },
    {
      icon: SiBoeing,
      color: '#0039A6',
      name: 'Boeing',
      description: 'Авиастроение и авиаперевозки',
    },
    {
      icon: SiAmericanairlines,
      color: '#0078D2',
      name: 'American Airlines',
      description: 'Международные авиаперевозки',
    },
    {
      icon: SiDelta,
      color: '#C8102E',
      name: 'Delta Airlines',
      description: 'Авиакомпания с обширной сетью маршрутов',
    },
    {
      icon: SiUnitedairlines,
      color: '#002244',
      name: 'United Airlines',
      description: 'Глобальные авиаперевозки',
    },
    {
      icon: SiSouthwestairlines,
      color: '#FF6600',
      name: 'Southwest Airlines',
      description: 'Бюджетные авиаперевозки',
    },
    {
      icon: SiJetblue,
      color: '#002D72',
      name: 'JetBlue',
      description: 'Комфортные авиаперевозки',
    },
    {
      icon: SiS7Airlines,
      color: '#0066CC',
      name: 'S7 Airlines',
      description: 'Российская авиакомпания',
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Левая секция с текстом */}
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h2
              className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Строим сильные партнерства с ведущими компаниями мира
            </motion.h2>

            <motion.p
              className="text-xl text-gray-600 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Сотрудничаем с предприятиями и стартапами, чтобы преодолевать границы,
              разрушать рынки и достигать революционных результатов.
            </motion.p>
          </motion.div>

          {/* Правая секция с логотипами */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
          >
            {/* Сетка логотипов 2x3 */}
            <div className="grid grid-cols-2 rounded-xl overflow-hidden">
              {logos.slice(0, 6).map((logo, index) => {
                const IconComponent = logo.icon;

                let borderClasses = '';

                if (index % 2 === 0) {
                  borderClasses += ' border-r border-gray-200';
                }

                if (index < 4) {
                  borderClasses += ' border-b border-gray-200';
                }

                return (
                  <div
                    key={index}
                    className={`flex items-center justify-center p-8 bg-white hover:bg-gray-50 transition-colors duration-200${borderClasses}`}
                  >
                    <div className="flex items-center space-x-3">
                      {logo.img ? (
                        <Image
                          src={logo.img}
                          alt={logo.name}
                          width={32}
                          height={32}
                          className="h-8 w-8 object-contain"
                        />
                      ) : (
                        <IconComponent
                          size={32}
                          style={{ color: logo.color }}
                          className="opacity-80"
                        />
                      )}
                      <span className="text-gray-700 font-medium text-lg">
                        {logo.name}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
