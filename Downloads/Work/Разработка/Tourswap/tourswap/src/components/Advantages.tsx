"use client";

import React from "react";
import { cn } from "@/lib/utils";
import createGlobe from "cobe";
import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { ShieldCheck, HandCoins, Headset, Plane, MapPin, CreditCard } from "lucide-react";
import WorldMap from "@/components/ui/world-map";
import { AnimatedList } from "@/components/magicui/animated-list";
import { SecurityBeamDemo } from "@/components/SecurityBeamDemo";

export function Advantages() {
  const features = [
    {
    title: "500+ направлений по всему миру",
      description:
        "Работаем только с проверенными партнёрами, сравниваем предложения сотен туроператоров и предлагаем специальные условия для рынка СНГ.",
      skeleton: <SkeletonOne />,
      className:
        "col-span-1 lg:col-span-4 border-b lg:border-r border-orange-200",
    },
    {
      title: "Лучшие цены на рынке",
      description:
        "Наша система мониторинга отслеживает цены у сотен туроператоров в режиме реального времени. Гарантируем скидки до 70%.",
      skeleton: <SkeletonTwo />,
      className: "border-b col-span-1 lg:col-span-2 border-orange-200",
    },
    {
      title: "Гарантия безопасности",
      description:
        "Ваша безопасность - наш приоритет. Тщательно проверяем всех партнёров, используем защищённые платёжные системы и страхуем каждую поездку.",
      skeleton: <SkeletonThree />,
      className:
        "col-span-1 lg:col-span-3 lg:border-r border-orange-200",
    },
    {
    title: "Поддержка экспертов 24/7",
      description:
        "Команда опытных тревел-консультантов всегда на связи. Помогаем с выбором тура и решаем любые вопросы во время путешествия.",
      skeleton: <SkeletonFour />,
      className: "col-span-1 lg:col-span-3 border-b lg:border-none",
    },
  ];
  
  return (
    <div className="relative z-20 py-6 lg:py-20 max-w-7xl mx-auto">
      <div className="px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12 will-change-transform"
          style={{ willChange: 'transform, opacity', transform: 'translateZ(0)' }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 text-left">
            Наши преимущества
          </h2>

          <p className="text-xl text-gray-600 max-w-2xl text-left">
            От поиска идеального направления до организации незабываемого отдыха - мы делаем ваше путешествие максимально комфортным и доступным.
          </p>
        </motion.div>
      </div>

      <div className="relative">
        <div className="grid grid-cols-1 lg:grid-cols-6 mt-8 xl:border rounded-md border-orange-200">
          {features.map((feature) => (
            <FeatureCard key={feature.title} className={feature.className}>
              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureDescription>{feature.description}</FeatureDescription>
              <div className="h-full w-full">{feature.skeleton}</div>
            </FeatureCard>
          ))}
        </div>
      </div>
    </div>
  );
}

const FeatureCard = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn(`p-4 sm:p-8 relative overflow-hidden`, className)}>
      {children}
    </div>
  );
};

const FeatureTitle = ({ children }: { children?: React.ReactNode }) => {
  return (
    <p className="max-w-5xl mx-auto text-left tracking-tight text-gray-900 text-xl md:text-2xl md:leading-snug font-semibold">
      {children}
    </p>
  );
};

const FeatureDescription = ({ children }: { children?: React.ReactNode }) => {
  return (
    <p
      className={cn(
        "text-sm md:text-base max-w-4xl text-left mx-auto",
        "text-gray-600 text-center font-normal",
        "text-left max-w-sm mx-0 md:text-sm my-2"
      )}
    >
      {children}
    </p>
  );
};

export const SkeletonOne = () => {
      return (
    <div className="relative flex py-2 px-2 gap-10 h-full">
      <div className="w-full p-2 mx-auto h-full">
        <div className="flex flex-1 w-full h-full flex-col space-y-2">
          <WorldMap 
              lineColor="#fb923c"
              dots={[
                // Европа -> Азия
                { start: { lat: 55.7558, lng: 37.6173 }, end: { lat: 41.0082, lng: 28.9784 } }, // Москва -> Стамбул
                
                // Азия -> Ближний Восток
                { start: { lat: 41.0082, lng: 28.9784 }, end: { lat: 25.276987, lng: 55.296249 } }, // Стамбул -> Дубай
                
                // Ближний Восток -> Южная Азия
                { start: { lat: 25.276987, lng: 55.296249 }, end: { lat: 27.1751, lng: 78.0421 } }, // Дубай -> Дели
                
                // Южная Азия -> Юго-Восточная Азия
                { start: { lat: 27.1751, lng: 78.0421 }, end: { lat: 13.7563, lng: 100.5018 } }, // Дели -> Бангкок
                
                // Юго-Восточная Азия -> Океания
                { start: { lat: 13.7563, lng: 100.5018 }, end: { lat: -8.7832, lng: 115.2169 } }, // Бангкок -> Бали
                
                // Океания -> Африка
                { start: { lat: -8.7832, lng: 115.2169 }, end: { lat: -1.2921, lng: 36.8219 } }, // Бали -> Найроби
                
                // Африка -> Европа
                { start: { lat: -1.2921, lng: 36.8219 }, end: { lat: 51.5074, lng: -0.1278 } }, // Найроби -> Лондон
                
                // Европа -> Северная Америка
                { start: { lat: 51.5074, lng: -0.1278 }, end: { lat: 40.7128, lng: -74.006 } }, // Лондон -> Нью-Йорк
                
                // Северная Америка -> Южная Америка
                { start: { lat: 40.7128, lng: -74.006 }, end: { lat: -15.7975, lng: -47.8919 } }, // Нью-Йорк -> Бразилиа
                
                // Южная Америка -> Европа
                { start: { lat: -15.7975, lng: -47.8919 }, end: { lat: 55.7558, lng: 37.6173 } }, // Бразилиа -> Москва
              ]}
            />
        </div>
      </div>


    </div>
  );
};

interface PriceItem {
  name: string;
  description: string;
  icon: string;
  color: string;
  time: string;
}

const PriceNotification = ({ name, description, icon, color, time }: PriceItem) => {
  return (
    <figure
      className={cn(
        "relative mx-auto min-h-fit w-full max-w-[400px] cursor-pointer overflow-hidden rounded-2xl p-4",
        "transition-all duration-200 ease-in-out hover:scale-[103%]",
        "bg-white border border-orange-200 shadow-sm hover:shadow-md",
      )}
    >
      <div className="flex flex-row items-center gap-3">
        <div className="flex flex-col overflow-hidden">
          <figcaption className="flex flex-row items-center whitespace-pre text-lg font-medium text-gray-900">
            <span className="text-sm sm:text-lg">{name}</span>
            <span className="mx-1">·</span>
            <span className="text-xs text-orange-600 font-bold">{time}</span>
          </figcaption>
          <p className="text-sm font-normal text-gray-600">
            {description}
          </p>
        </div>
      </div>
    </figure>
  );
};

export const SkeletonTwo = () => {
  let priceUpdates = [
    {
      name: "Турция, Анталия",
      description: "Цена снижена на 2000₽",
      time: "-70%",
      icon: "✈️",
      color: "#fb923c",
    },
    {
      name: "Египет, Хургада",
      description: "Горящий тур найден",
      time: "-65%",
      icon: "🏖️",
      color: "#f97316",
    },
    {
      name: "ОАЭ, Дубай",
      description: "Эксклюзивное предложение",
      time: "-60%",
      icon: "🏙️",
      color: "#ea580c",
    },
    {
      name: "Мальдивы",
      description: "Лучшая цена за сезон",
      time: "-55%",
      icon: "🏝️",
      color: "#dc2626",
    },
    {
      name: "Таиланд, Пхукет",
      description: "Акция до конца месяца",
      time: "-50%",
      icon: "🌴",
      color: "#c2410c",
    },
    {
      name: "Греция, Крит",
      description: "Раннее бронирование",
      time: "-45%",
      icon: "🏛️",
      color: "#b45309",
    },
  ];

  priceUpdates = Array.from({ length: 3 }, () => priceUpdates).flat();
  
  return (
    <div className="relative flex h-[400px] w-full flex-col overflow-hidden p-2">
      <AnimatedList delay={2000}>
        {priceUpdates.map((item, idx) => (
          <PriceNotification {...item} key={idx} />
        ))}
      </AnimatedList>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-white"></div>
    </div>
  );
};

export const SkeletonThree = () => {
  return (
    <div className="relative flex flex-col items-center justify-center p-0 h-full -mt-16">
      <SecurityBeamDemo />
      </div>
  );
};

export const SkeletonFour = () => {
  const [visibleMessages, setVisibleMessages] = React.useState<number>(0);
  const allMessages = [
    { id: 1, text: "Здравствуйте! Чем могу помочь?", isBot: true, time: "14:30" },
    { id: 2, text: "Хочу забронировать тур в Турцию", isBot: false, time: "14:31" },
    { id: 3, text: "Отлично! У нас есть горящие предложения от 45,000₽", isBot: true, time: "14:31" },
    { id: 4, text: "Покажите варианты", isBot: false, time: "14:32" },
    { id: 5, text: "Отправляю вам лучшие предложения...", isBot: true, time: "14:32" },
  ];

  React.useEffect(() => {
    const interval = setInterval(() => {
      setVisibleMessages(prev => {
        if (prev < allMessages.length) {
          return prev + 1;
        } else {
          // Когда все сообщения показаны, начинаем заново
          return 1;
        }
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-80 md:h-80 flex flex-col relative p-4 overflow-hidden">


      {/* Сообщения */}
      <div className="flex-1 mb-4 flex flex-col justify-end overflow-hidden">
        <div className="flex-1 flex flex-col justify-end space-y-3">
          {allMessages.slice(0, visibleMessages).map((message) => (
        <motion.div
              key={`${message.id}-${visibleMessages}`}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ 
            duration: 0.8, 
                ease: "easeOut",
            type: "spring",
            stiffness: 100,
                damping: 15
              }}
              className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
            >
              <div className={`max-w-xs px-3 py-2 rounded-2xl ${
                message.isBot 
                  ? 'bg-orange-100 text-gray-800' 
                  : 'bg-orange-500 text-white'
              }`}>
                <p className="text-sm">{message.text}</p>
                <p className={`text-xs mt-1 ${
                  message.isBot ? 'text-gray-500' : 'text-orange-100'
                }`}>
                  {message.time}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Поле ввода */}
      <div className="flex items-center space-x-2">
        <div className="flex-1 bg-gray-50 rounded-full px-4 py-2">
          <input 
            type="text" 
            placeholder="Написать сообщение..."
            className="w-full bg-transparent text-sm outline-none"
            disabled
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center"
        >
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </motion.button>
      </div>
    </div>
  );
};

export const Globe = ({ className }: { className?: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let phi = 0;

    if (!canvasRef.current) return;

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: 600 * 2,
      height: 600 * 2,
      phi: 0,
      theta: 0,
      dark: 0,
      diffuse: 1.8,
      mapSamples: 16000,
      mapBrightness: 3,
      baseColor: [0.8, 0.8, 0.8], // Светло-серый цвет земли
      markerColor: [1, 0.4, 0.1], // Яркий оранжевый для маркеров
      glowColor: [0, 0, 0], // Убираем свечение
      markers: [
        // Популярные туристические направления
        { location: [41.0082, 28.9784], size: 0.05 }, // Стамбул
        { location: [25.2048, 55.2708], size: 0.04 }, // Дубай  
        { location: [27.1751, 78.0421], size: 0.03 }, // Агра (Тадж-Махал)
        { location: [13.7563, 100.5018], size: 0.04 }, // Бангкок
        { location: [4.2105, 73.1560], size: 0.03 }, // Мале (Мальдивы)
        { location: [26.0667, 50.5577], size: 0.03 }, // Манама (Бахрейн)
      ],
      onRender: (state) => {
        state.phi = phi;
        phi += 0.005; // Медленное вращение
      },
    });

    return () => {
      globe.destroy();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: 600, height: 600, maxWidth: "100%", aspectRatio: 1 }}
      className={className}
    />
  );
};

export default Advantages;