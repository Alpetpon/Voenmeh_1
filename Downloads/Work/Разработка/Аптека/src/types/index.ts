// Базовые типы
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Типы товаров
export interface Product extends BaseEntity {
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  sku: string;
  images: string[];
  category: Category;
  categoryId: string;
  brand?: string;
  form: ProductForm;
  dosage?: string;
  composition?: string;
  contraindications?: string;
  instructions?: string;
  inStock: boolean;
  stockCount: number;
  isDiscounted: boolean;
  discountPercent?: number;
  tags: string[];
  rating?: number;
  reviewsCount: number;
  requiresPrescription: boolean;
  manufacturer?: string;
  country?: string;
  expirationDate?: Date;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
}

export interface Category extends BaseEntity {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  parent?: Category;
  children?: Category[];
  isActive: boolean;
  sortOrder: number;
  seoTitle?: string;
  seoDescription?: string;
}

export interface ProductForm {
  id: string;
  name: string;
  slug: string;
}

// Типы аптек и локаций
export interface Store extends BaseEntity {
  name: string;
  address: string;
  city: string;
  phone: string;
  email?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  workingHours: WorkingHours[];
  isActive: boolean;
  hasPharmacist: boolean;
  services: StoreService[];
  image?: string;
  rating?: number;
  reviewsCount: number;
}

export interface WorkingHours {
  dayOfWeek: number; // 0-6, где 0 = Воскресенье
  openTime: string; // "09:00"
  closeTime: string; // "21:00"
  isWorkingDay: boolean;
}

export interface StoreService {
  id: string;
  name: string;
  description?: string;
  isAvailable: boolean;
}

// Типы акций и промо
export interface Promotion extends BaseEntity {
  title: string;
  description: string;
  image?: string;
  discountPercent?: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  products?: Product[];
  categories?: Category[];
  promoCode?: string;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usedCount: number;
}

// Типы для записей на прием
export interface Appointment extends BaseEntity {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  storeId: string;
  store: Store;
  serviceType: AppointmentService;
  date: Date;
  timeSlot: string;
  status: AppointmentStatus;
  notes?: string;
  reminderSent: boolean;
}

export enum AppointmentService {
  CONSULTATION = 'consultation',
  VACCINATION = 'vaccination',
  PRESSURE_CHECK = 'pressure_check',
  GLUCOSE_TEST = 'glucose_test',
  OTHER = 'other',
}

export enum AppointmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
}

// Типы для обратной связи
export interface Feedback extends BaseEntity {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: FeedbackStatus;
  response?: string;
  responseDate?: Date;
  rating?: number;
  storeId?: string;
  store?: Store;
}

export enum FeedbackStatus {
  NEW = 'new',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

// API типы
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// Типы для фильтров и поиска
export interface ProductFilters {
  categoryId?: string;
  brandId?: string;
  formId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  isDiscounted?: boolean;
  requiresPrescription?: boolean;
  tags?: string[];
  rating?: number;
  search?: string;
}

export interface ProductSortOptions {
  field: 'name' | 'price' | 'rating' | 'createdAt';
  direction: 'asc' | 'desc';
}

// Типы для UI компонентов
export interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

export interface NavigationItem {
  label: string;
  href: string;
  icon?: string;
  children?: NavigationItem[];
  isExternal?: boolean;
}

export interface CarouselItem {
  id: string;
  title: string;
  description?: string;
  image: string;
  href?: string;
  cta?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  avatar?: string;
  rating: number;
  text: string;
  date: Date;
  storeId?: string;
}

// Типы для форм
export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  storeId?: string;
}

export interface AppointmentFormData {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  storeId: string;
  serviceType: AppointmentService;
  date: string;
  timeSlot: string;
  notes?: string;
}

export interface SearchSuggestion {
  id: string;
  text: string;
  type: 'product' | 'category' | 'brand';
  url: string;
  image?: string;
}

// Типы для состояния приложения
export interface AppState {
  theme: 'light' | 'dark' | 'system';
  user?: User;
  cart: CartState;
  search: SearchState;
  ui: UIState;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  isAdmin: boolean;
}

export interface CartState {
  items: CartItem[];
  total: number;
  isOpen: boolean;
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  storeId?: string;
}

export interface SearchState {
  query: string;
  suggestions: SearchSuggestion[];
  isLoading: boolean;
  recentSearches: string[];
}

export interface UIState {
  isMobileMenuOpen: boolean;
  isSearchOpen: boolean;
  toast: ToastState[];
  loading: LoadingState;
}

export interface ToastState {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  duration?: number;
}

export interface LoadingState {
  [key: string]: boolean;
}

// Типы для SEO и метаданных
export interface SEOData {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  canonical?: string;
  noindex?: boolean;
  nofollow?: boolean;
}

// Типы для аналитики
export interface AnalyticsEvent {
  event: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  userId?: string;
  sessionId: string;
  timestamp: Date;
}

// Утилитарные типы
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type Nullable<T> = T | null;
export type ArrayElement<ArrayType extends readonly unknown[]> = ArrayType[number];

// Все типы уже экспортированы выше 