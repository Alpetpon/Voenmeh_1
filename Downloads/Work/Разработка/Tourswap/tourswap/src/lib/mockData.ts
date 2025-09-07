import { Tour } from '@/types';

export const mockTours: Tour[] = [
  {
    id: "1",
    title: "Отель Море Сочи",
    location: "Сочи",
    price: 100000,
    originalPrice: 230000,
    image: "/tours/hotel-1.jpg",
    duration: "7 дней",
    type: "Отель",
    rating: 4.5,
    reviews: 127,
    mealType: "Все включено",
    maxGuests: 4
  },
  {
    id: "2",
    title: "Гран Инна Кута Бали",
    location: "Бали, Индонезия", 
    price: 450000,
    originalPrice: 650000,
    image: "/tours/hotel-2.jpg",
    duration: "5 дней",
    type: "Отель",
    rating: 4.8,
    reviews: 203,
    mealType: "Завтраки",
    maxGuests: 2
  },
  {
    id: "3",
    title: "Romance Istanbul Hotel",
    location: "Стамбул, Турция",
    price: 300000,
    originalPrice: 500000,
    image: "/tours/hotel-3.jpg",
    duration: "4 дня",
    type: "Отель",
    rating: 4.3,
    reviews: 89,
    mealType: "Полупансион",
    maxGuests: 3
  },
  {
    id: "4",
    title: "Марриотт Абшерон Баку",
    location: "Баку, Азербайджан",
    price: 210000,
    originalPrice: 350000,
    image: "/tours/hotel-4.jpg",
    duration: "3 дня",
    type: "Отель", 
    rating: 4.6,
    reviews: 156,
    mealType: "Завтраки",
    maxGuests: 2
  },
  {
    id: "5",
    title: "Scandic Continental",
    location: "Стокгольм, Швеция",
    price: 350000,
    originalPrice: 520000,
    image: "/tours/hotel-5.jpg",
    duration: "10 дней",
    type: "Отель",
    rating: 4.7,
    reviews: 94,
    mealType: "Без питания",
    maxGuests: 6
  },
  {
    id: "6",
    title: "Москва Марриотт",
    location: "Москва, Россия",
    price: 550000,
    originalPrice: 850000,
    image: "/tours/hotel-6.jpg",
    duration: "23 дня",
    type: "Отель",
    rating: 4.4,
    reviews: 78,
    mealType: "Полный пансион",
    maxGuests: 4
  },
  {
    id: "7",
    title: "Rixos Premium Dubai",
    location: "Дубай, ОАЭ",
    price: 680000,
    originalPrice: 1200000,
    image: "/tours/hotel-7.jpg",
    duration: "6 дней",
    type: "Отель",
    rating: 4.9,
    reviews: 312,
    mealType: "Все включено",
    maxGuests: 3
  },
  {
    id: "8",
    title: "Four Seasons Bora Bora",
    location: "Бора-Бора",
    price: 950000,
    originalPrice: 1500000,
    image: "/tours/hotel-8.jpg",
    duration: "8 дней",
    type: "Вилла",
    rating: 5.0,
    reviews: 89,
    mealType: "Завтраки",
    maxGuests: 2
  }
];

export const partnerLogos = [
  { name: "Яндекс", logo: "/partners/yandex.svg" },
  { name: "Туту.ру", logo: "/partners/tutu.svg" },
  { name: "Booking", logo: "/partners/booking.svg" },
  { name: "Aviasales", logo: "/partners/aviasales.svg" },
  { name: "TripAdvisor", logo: "/partners/tripadvisor.svg" }
];