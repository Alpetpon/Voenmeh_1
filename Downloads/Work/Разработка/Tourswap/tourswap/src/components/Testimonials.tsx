'use client';

import Marquee from './Marquee';

export default function Testimonials() {
  const testimonials = [
    <div key="testimonial-1" className="bg-white border border-gray-200 rounded-xl p-6 w-full flex-shrink-0 shadow-sm hover:shadow-md transition-shadow">
      <p className="text-gray-700 mb-4 font-medium text-sm leading-relaxed">
        "TourSwap помог найти идеальный отдых со скидкой 60%. Сервис просто потрясающий!"
      </p>
      <div className="flex items-center">
        <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
          АН
        </div>
        <div>
          <p className="font-semibold text-sm text-gray-900">Анна Николаева</p>
          <p className="text-xs text-gray-500">Москва</p>
        </div>
      </div>
    </div>,
    
    <div key="testimonial-2" className="bg-white border border-gray-200 rounded-xl p-6 w-full flex-shrink-0 shadow-sm hover:shadow-md transition-shadow">
      <p className="text-gray-700 mb-4 font-medium text-sm leading-relaxed">
        "Забронировал тур на Мальдивы со скидкой 45%. Качество на высоте!"
      </p>
      <div className="flex items-center">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
          МК
        </div>
        <div>
          <p className="font-semibold text-sm text-gray-900">Михаил Королев</p>
          <p className="text-xs text-gray-500">Санкт-Петербург</p>
        </div>
      </div>
    </div>,

    <div key="testimonial-3" className="bg-white border border-gray-200 rounded-xl p-6 w-full flex-shrink-0 shadow-sm hover:shadow-md transition-shadow">
      <p className="text-gray-700 mb-4 font-medium text-sm leading-relaxed">
        "Отличная платформа! Нашли тур в Турцию с 50% скидкой. Рекомендую всем!"
      </p>
      <div className="flex items-center">
        <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
          ЕС
        </div>
        <div>
          <p className="font-semibold text-sm text-gray-900">Елена Смирнова</p>
          <p className="text-xs text-gray-500">Екатеринбург</p>
        </div>
      </div>
    </div>,

    <div key="testimonial-4" className="bg-white border border-gray-200 rounded-xl p-6 w-full flex-shrink-0 shadow-sm hover:shadow-md transition-shadow">
      <p className="text-gray-700 mb-4 font-medium text-sm leading-relaxed">
        "Быстро и удобно! Сэкономили 30000₽ на семейном отдыхе в Греции."
      </p>
      <div className="flex items-center">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
          ДП
        </div>
        <div>
          <p className="font-semibold text-sm text-gray-900">Дмитрий Петров</p>
          <p className="text-xs text-gray-500">Новосибирск</p>
        </div>
      </div>
    </div>,

    <div key="testimonial-5" className="bg-white border border-gray-200 rounded-xl p-6 w-full flex-shrink-0 shadow-sm hover:shadow-md transition-shadow">
      <p className="text-gray-700 mb-4 font-medium text-sm leading-relaxed">
        "Самый лучший сервис для поиска отказных туров. Пользуюсь уже год!"
      </p>
      <div className="flex items-center">
        <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
          ОЛ
        </div>
        <div>
          <p className="font-semibold text-sm text-gray-900">Ольга Лебедева</p>
          <p className="text-xs text-gray-500">Казань</p>
        </div>
      </div>
    </div>,

    <div key="testimonial-6" className="bg-white border border-gray-200 rounded-xl p-6 w-full flex-shrink-0 shadow-sm hover:shadow-md transition-shadow">
      <p className="text-gray-700 mb-4 font-medium text-sm leading-relaxed">
        "Отпуск мечты в Таиланде стал реальностью благодаря TourSwap!"
      </p>
      <div className="flex items-center">
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
          ИВ
        </div>
        <div>
          <p className="font-semibold text-sm text-gray-900">Игорь Волков</p>
          <p className="text-xs text-gray-500">Красноярск</p>
        </div>
      </div>
    </div>,

    <div key="image-1" className="w-full h-48 flex-shrink-0 rounded-xl overflow-hidden shadow-sm">
      <img 
        src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop&auto=format&q=80" 
        alt="Путешествие" 
        className="w-full h-full object-cover"
      />
    </div>,
    
    <div key="testimonial-7" className="bg-white border border-gray-200 rounded-xl p-6 w-full flex-shrink-0 shadow-sm hover:shadow-md transition-shadow">
      <p className="text-gray-700 mb-4 font-medium text-sm leading-relaxed">
        "Профессиональный подход и отличные цены. Спасибо за чудесный отдых!"
      </p>
      <div className="flex items-center">
        <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
          МА
        </div>
        <div>
          <p className="font-semibold text-sm text-gray-900">Мария Андреева</p>
          <p className="text-xs text-gray-500">Ростов-на-Дону</p>
        </div>
      </div>
    </div>,

    <div key="image-2" className="w-full h-48 flex-shrink-0 rounded-xl overflow-hidden shadow-sm">
      <img 
        src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&auto=format&q=80" 
        alt="Путешествие" 
        className="w-full h-full object-cover"
      />
    </div>,

    <div key="testimonial-8" className="bg-white border border-gray-200 rounded-xl p-6 w-full flex-shrink-0 shadow-sm hover:shadow-md transition-shadow">
      <p className="text-gray-700 mb-4 font-medium text-sm leading-relaxed">
        "Невероятно! Сэкономили 40% на туре в Египет. Качество превзошло ожидания."
      </p>
      <div className="flex items-center">
        <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
          АК
        </div>
        <div>
          <p className="font-semibold text-sm text-gray-900">Алексей Кузнецов</p>
          <p className="text-xs text-gray-500">Нижний Новгород</p>
        </div>
      </div>
    </div>,

    <div key="image-3" className="w-full h-48 flex-shrink-0 rounded-xl overflow-hidden shadow-sm">
      <img 
        src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop&auto=format&q=80" 
        alt="Путешествие" 
        className="w-full h-full object-cover"
      />
    </div>,

    <div key="testimonial-9" className="bg-white border border-gray-200 rounded-xl p-6 w-full flex-shrink-0 shadow-sm hover:shadow-md transition-shadow">
      <p className="text-gray-700 mb-4 font-medium text-sm leading-relaxed">
        "Лучший сайт для экономных путешественников. Всегда нахожу отличные предложения!"
      </p>
      <div className="flex items-center">
        <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
          ТР
        </div>
        <div>
          <p className="font-semibold text-sm text-gray-900">Татьяна Романова</p>
          <p className="text-xs text-gray-500">Воронеж</p>
        </div>
      </div>
    </div>,

    <div key="testimonial-10" className="bg-white border border-gray-200 rounded-xl p-6 w-full flex-shrink-0 shadow-sm hover:shadow-md transition-shadow">
      <p className="text-gray-700 mb-4 font-medium text-sm leading-relaxed">
        "TourSwap - это находка! Горящий тур на Кипр со скидкой 55%."
      </p>
      <div className="flex items-center">
        <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
          СФ
        </div>
        <div>
          <p className="font-semibold text-sm text-gray-900">Сергей Федоров</p>
          <p className="text-xs text-gray-500">Самара</p>
        </div>
      </div>
    </div>,

    <div key="image-4" className="w-full h-48 flex-shrink-0 rounded-xl overflow-hidden shadow-sm">
      <img 
        src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop&auto=format&q=80" 
        alt="Путешествие" 
        className="w-full h-full object-cover"
      />
    </div>,

    <div key="testimonial-11" className="bg-white border border-gray-200 rounded-xl p-6 w-full flex-shrink-0 shadow-sm hover:shadow-md transition-shadow">
      <p className="text-gray-700 mb-4 font-medium text-sm leading-relaxed">
        "Удобный интерфейс, отличные цены. Рекомендую друзьям и знакомым!"
      </p>
      <div className="flex items-center">
        <div className="w-10 h-10 bg-gradient-to-br from-lime-400 to-lime-600 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
          НМ
        </div>
        <div>
          <p className="font-semibold text-sm text-gray-900">Наталья Морозова</p>
          <p className="text-xs text-gray-500">Челябинск</p>
        </div>
      </div>
    </div>,

    <div key="testimonial-12" className="bg-white border border-gray-200 rounded-xl p-6 w-full flex-shrink-0 shadow-sm hover:shadow-md transition-shadow">
      <p className="text-gray-700 mb-4 font-medium text-sm leading-relaxed">
        "Отпуск на Бали стал доступным благодаря TourSwap. Спасибо за мечту!"
      </p>
      <div className="flex items-center">
        <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
          ВТ
        </div>
        <div>
          <p className="font-semibold text-sm text-gray-900">Виктория Титова</p>
          <p className="text-xs text-gray-500">Пермь</p>
        </div>
      </div>
    </div>,

    <div key="image-5" className="w-full h-48 flex-shrink-0 rounded-xl overflow-hidden shadow-sm">
      <img 
        src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&auto=format&q=80" 
        alt="Путешествие" 
        className="w-full h-full object-cover"
      />
    </div>,

    <div key="testimonial-13" className="bg-white border border-gray-200 rounded-xl p-6 w-full flex-shrink-0 shadow-sm hover:shadow-md transition-shadow">
      <p className="text-gray-700 mb-4 font-medium text-sm leading-relaxed">
        "Просто лучший! Экономия времени и денег при планировании отпуска."
      </p>
      <div className="flex items-center">
        <div className="w-10 h-10 bg-gradient-to-br from-violet-400 to-violet-600 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
          РК
        </div>
        <div>
          <p className="font-semibold text-sm text-gray-900">Роман Козлов</p>
          <p className="text-xs text-gray-500">Уфа</p>
        </div>
      </div>
    </div>,

    <div key="image-6" className="w-full h-48 flex-shrink-0 rounded-xl overflow-hidden shadow-sm">
      <img 
        src="https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=400&h=300&fit=crop&auto=format&q=80" 
        alt="Путешествие" 
        className="w-full h-full object-cover"
      />
    </div>,

    <div key="testimonial-14" className="bg-white border border-gray-200 rounded-xl p-6 w-full flex-shrink-0 shadow-sm hover:shadow-md transition-shadow">
      <p className="text-gray-700 mb-4 font-medium text-sm leading-relaxed">
        "Качественный сервис! Тур в Италию превзошел все ожидания."
      </p>
      <div className="flex items-center">
        <div className="w-10 h-10 bg-gradient-to-br from-rose-400 to-rose-600 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
          ЛП
        </div>
        <div>
          <p className="font-semibold text-sm text-gray-900">Людмила Павлова</p>
          <p className="text-xs text-gray-500">Тюмень</p>
        </div>
      </div>
    </div>,

    <div key="image-7" className="w-full h-48 flex-shrink-0 rounded-xl overflow-hidden shadow-sm">
      <img 
        src="https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=400&h=300&fit=crop&auto=format&q=80" 
        alt="Путешествие" 
        className="w-full h-full object-cover"
      />
    </div>
  ];

  // Разделяем отзывы на три колонки
  const columns = [
    testimonials.slice(0, Math.ceil(testimonials.length / 3)),
    testimonials.slice(Math.ceil(testimonials.length / 3), Math.ceil(testimonials.length * 2 / 3)),
    testimonials.slice(Math.ceil(testimonials.length * 2 / 3))
  ];

  return (
    <section className="relative bg-gradient-to-b from-white to-gray-50 py-20 overflow-hidden">
      {/* Заголовок секции */}
      <div className="text-center mb-16 px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Любимы путешественниками по всей России
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Тысячи довольных клиентов выбирают TourSwap для своих незабываемых путешествий
        </p>
      </div>
      
      {/* Три вертикальные колонки с marquee */}
      <div className="flex gap-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Первая колонка - движется вниз */}
        <div className="flex-1">
          <Marquee vertical pauseOnHover className="[--duration:30s] h-[600px]">
            {columns[0].map((testimonial, index) => (
              <div key={`col-1-${index}`} className="mb-4">
                {testimonial}
              </div>
            ))}
          </Marquee>
        </div>
        
        {/* Вторая колонка - движется вверх */}
        <div className="flex-1">
          <Marquee vertical reverse pauseOnHover className="[--duration:35s] h-[600px]">
            {columns[1].map((testimonial, index) => (
              <div key={`col-2-${index}`} className="mb-4">
                {testimonial}
              </div>
            ))}
          </Marquee>
        </div>
        
        {/* Третья колонка - движется вниз */}
        <div className="flex-1">
          <Marquee vertical pauseOnHover className="[--duration:40s] h-[600px]">
            {columns[2].map((testimonial, index) => (
              <div key={`col-3-${index}`} className="mb-4">
                {testimonial}
              </div>
            ))}
          </Marquee>
        </div>
      </div>
      
      {/* Градиентные маски сверху и снизу */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white to-transparent pointer-events-none z-10"></div>
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none z-10"></div>
    </section>
  );
}