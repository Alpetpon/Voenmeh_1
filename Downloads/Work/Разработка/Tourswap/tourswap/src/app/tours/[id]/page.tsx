'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { mockTours } from '@/lib/mockData';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { MapPin, Star, Users, Utensils, Clock } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import Button from '@/components/ui/Button';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

// Галерея изображений (демо). Можно заменить на реальные фотографии туров
const galleryUrls = [
  'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=600&fit=crop&auto=format&q=80',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=300&fit=crop&auto=format&q=80',
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop&auto=format&q=80',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=300&fit=crop&auto=format&q=80',
  'https://images.unsplash.com/photo-1578645510447-e20b4311e3ce?w=400&h=300&fit=crop&auto=format&q=80'
];

export default function TourDetailsPage({ params }: PageProps) {
  const [tour, setTour] = useState<any>(null);
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    const loadTour = async () => {
      const { id } = await params;
      const foundTour = mockTours.find((t) => t.id === id);
      if (!foundTour) {
        notFound();
      }
      setTour(foundTour);
      setDiscount(Math.round(((foundTour.originalPrice - foundTour.price) / foundTour.originalPrice) * 100));
    };
    loadTour();
  }, [params]);

  if (!tour) {
    return <div>Loading...</div>;
  }

  return <TourDetailsClient tour={tour} discount={discount} />;
}

function TourDetailsClient({ tour, discount }: { tour: any; discount: number }) {
  const [selectedImage, setSelectedImage] = useState(0);

  const amenities = [
    'Wi-Fi',
    'Бассейн',
    'Кондиционер',
    'Парковка',
    'Фитнес-центр',
    'Бар',
    'Сейф',
    'Прачечная'
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-grow pt-20">
        {/* Хлебные крошки */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <nav className="flex items-center space-x-2 text-sm text-gray-500">
              <Link href="/" className="hover:text-orange-500 transition-colors">
                Главная
              </Link>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <Link href="/catalog" className="hover:text-orange-500 transition-colors">
                Каталог
              </Link>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-gray-900 font-medium">{tour?.title}</span>
            </nav>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Основная информация */}
          <section className="flex flex-col lg:flex-row gap-10">
            {/* Левая колонка - галерея и детали тура */}
            <div className="flex-1 lg:w-2/3">
              {/* Галерея */}
              <div className="mb-10">
                {/* Главное изображение */}
                <div className="relative mb-4">
                  <div
                    className="w-full h-[500px] rounded-xl bg-cover bg-center"
                    style={{ backgroundImage: `url(${galleryUrls[selectedImage]})` }}
                  >
                    <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-lg text-xs font-semibold shadow">
                      -{discount}%
                    </div>
                  </div>
                </div>
                
                {/* Миниатюры */}
                <div className="grid grid-cols-5 gap-2">
                  {galleryUrls.map((url, idx) => (
                    <div
                      key={idx}
                      className={`relative h-20 rounded-lg bg-cover bg-center cursor-pointer transition-all duration-200 ${
                        selectedImage === idx 
                          ? 'ring-2 ring-orange-500 opacity-100' 
                          : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{ backgroundImage: `url(${url})` }}
                      onClick={() => setSelectedImage(idx)}
                    />
                  ))}
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{tour!.title}</h1>

              <div className="flex items-center text-gray-500 mb-4">
                <MapPin className="w-5 h-5 mr-1 text-orange-500" />
                <span>{tour!.location}</span>
              </div>

              {/* Рейтинг, длительность, гости, питание */}
              <div className="flex items-center flex-wrap gap-4 mb-6">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < Math.floor(tour!.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                    />
                  ))}
                  <span className="ml-2 text-sm text-gray-500">{tour!.rating}</span>
                </div>

                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{tour!.duration}</span>
                </div>

                <div className="flex items-center text-sm text-gray-500">
                  <Users className="h-4 w-4 mr-1" />
                  <span>до {tour!.maxGuests} чел</span>
                </div>

                <div className="flex items-center text-sm text-gray-500">
                  <Utensils className="h-4 w-4 mr-1" />
                  <span>{tour!.mealType}</span>
                </div>
              </div>

              {/* Описание */}
              <p className="text-gray-700 mb-6 leading-relaxed">
                Этот тур предлагает незабываемый отдых в {tour!.location}. Вас ждёт комфортное размещение,
                насыщенная экскурсионная программа и отличный сервис. Каждая деталь организована для того,
                чтобы ваше путешествие стало по-настоящему особенным.
              </p>

              {/* Удобства */}
              <div className="mb-10">
                <h2 className="text-xl font-semibold mb-3">Удобства</h2>
                <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm text-gray-600">
                  {amenities.map((item) => (
                    <li key={item} className="before:content-['–'] before:mr-1">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>


            </div>

            {/* Правый сайдбар - липкий */}
            <div className="lg:w-1/3">
              <div className="sticky top-28 bg-gray-50 rounded-2xl p-6 shadow-sm z-10">
                <div className="mb-4">
                  <span className="text-3xl font-bold text-gray-900">{formatPrice(tour!.price)}</span>
                  <span className="text-sm text-gray-400 line-through ml-2">
                    {formatPrice(tour!.originalPrice)}
                  </span>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg shadow hover:shadow-lg transition"
                >
                  Забронировать
                </Button>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
