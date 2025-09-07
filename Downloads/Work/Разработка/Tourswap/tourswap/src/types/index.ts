export interface Tour {
  id: string;
  title: string;
  location: string;
  price: number;
  originalPrice: number;
  image: string;
  rating: number;
  reviews: number;
  duration: string;
  type: string;
  mealType: string;
  maxGuests: number;
}

export interface SearchFilters {
  from: string;
  to: string;
  departureDate: string;
  returnDate: string;
  guests: number;
}