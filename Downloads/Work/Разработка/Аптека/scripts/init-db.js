const { Pool } = require('pg');

// Конфигурация подключения к PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'ecolife_pharmacy',
  password: process.env.DB_PASSWORD || 'password',
  port: parseInt(process.env.DB_PORT || '5432'),
});

// SQL для создания таблиц
const createTablesSQL = `
-- Таблица категорий
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(100),
  parent_id INTEGER REFERENCES categories(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Таблица товаров
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  old_price DECIMAL(10,2),
  category_id INTEGER REFERENCES categories(id),
  brand VARCHAR(255),
  form VARCHAR(100),
  prescription_required BOOLEAN DEFAULT false,
  in_stock BOOLEAN DEFAULT true,
  stock_quantity INTEGER DEFAULT 0,
  images TEXT[],
  instructions TEXT,
  contraindications TEXT,
  side_effects TEXT,
  composition TEXT,
  dosage VARCHAR(255),
  storage_conditions TEXT,
  expiry_date DATE,
  is_active BOOLEAN DEFAULT true,
  rating DECIMAL(3,2) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  search_vector TSVECTOR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Таблица аптек
CREATE TABLE IF NOT EXISTS stores (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  working_hours JSONB,
  services TEXT[],
  has_parking BOOLEAN DEFAULT false,
  is_24h BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Таблица пользователей
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  birth_date DATE,
  is_verified BOOLEAN DEFAULT false,
  role VARCHAR(20) DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Таблица записей на консультации
CREATE TABLE IF NOT EXISTS appointments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  store_id INTEGER REFERENCES stores(id),
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_email VARCHAR(255),
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  service_type VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  notes TEXT,
  pharmacist_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Индексы для поиска
CREATE INDEX IF NOT EXISTS idx_products_search ON products USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_stores_location ON stores(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_stores_city ON stores(city);
`;

// Тестовые данные
const insertTestDataSQL = `
-- Категории
INSERT INTO categories (name, slug, description, icon) VALUES
('Лекарственные препараты', 'medicines', 'Рецептурные и безрецептурные лекарства', 'pill'),
('Витамины и БАДы', 'vitamins', 'Витамины, минералы и биологически активные добавки', 'vitamin'),
('Косметика и уход', 'cosmetics', 'Косметические средства и товары для ухода', 'cosmetic'),
('Медицинские изделия', 'medical-devices', 'Медицинские приборы и изделия', 'device'),
('Детские товары', 'baby', 'Товары для детей и новорожденных', 'baby')
ON CONFLICT (slug) DO NOTHING;

-- Товары
INSERT INTO products (name, slug, description, price, old_price, category_id, brand, form, prescription_required, in_stock, images, rating, reviews_count) VALUES
('Парацетамол 500мг', 'paracetamol-500mg', 'Жаропонижающее и обезболивающее средство', 89.50, 120.00, 1, 'Фармстандарт', 'Таблетки', false, true, ARRAY['/images/paracetamol.jpg'], 4.5, 156),
('Витамин D3 2000 МЕ', 'vitamin-d3-2000', 'Витамин D3 для поддержания здоровья костей', 450.00, NULL, 2, 'Solgar', 'Капсулы', false, true, ARRAY['/images/vitamin-d3.jpg'], 4.8, 89),
('Крем для лица увлажняющий', 'face-cream-moisturizing', 'Увлажняющий крем для ежедневного ухода', 320.00, 380.00, 3, 'La Roche-Posay', 'Крем', false, true, ARRAY['/images/face-cream.jpg'], 4.3, 67),
('Тонометр автоматический', 'tonometer-automatic', 'Автоматический тонометр для измерения давления', 2890.00, NULL, 4, 'Omron', 'Прибор', false, true, ARRAY['/images/tonometer.jpg'], 4.7, 234),
('Детская смесь NAN', 'baby-formula-nan', 'Детская молочная смесь с рождения', 680.00, NULL, 5, 'Nestle', 'Смесь', false, true, ARRAY['/images/baby-formula.jpg'], 4.6, 123),
('Ибупрофен 400мг', 'ibuprofen-400mg', 'Противовоспалительное и обезболивающее средство', 125.00, NULL, 1, 'Борисовский ЗМП', 'Таблетки', false, true, ARRAY['/images/ibuprofen.jpg'], 4.4, 98),
('Омега-3', 'omega-3', 'Полиненасыщенные жирные кислоты', 890.00, 1200.00, 2, 'Nordic Naturals', 'Капсулы', false, true, ARRAY['/images/omega-3.jpg'], 4.9, 156),
('Шампунь лечебный', 'therapeutic-shampoo', 'Лечебный шампунь против перхоти', 450.00, NULL, 3, 'Vichy', 'Шампунь', false, true, ARRAY['/images/shampoo.jpg'], 4.2, 45)
ON CONFLICT (slug) DO NOTHING;

-- Аптеки
INSERT INTO stores (name, address, city, phone, latitude, longitude, services, has_parking, is_24h, working_hours) VALUES
('ЭкоЛайф на Тверской', 'ул. Тверская, 15', 'Москва', '+7 (495) 123-45-67', 55.7558, 37.6176, ARRAY['Консультация фармацевта', 'Измерение давления', 'Доставка'], true, false, '{"monday": {"open": "08:00", "close": "22:00"}, "tuesday": {"open": "08:00", "close": "22:00"}}'),
('ЭкоЛайф Центральная', 'пр. Невский, 28', 'Санкт-Петербург', '+7 (812) 987-65-43', 59.9311, 30.3609, ARRAY['Консультация фармацевта', 'Вакцинация'], false, true, '{}'),
('ЭкоЛайф на Арбате', 'ул. Арбат, 42', 'Москва', '+7 (495) 234-56-78', 55.7520, 37.5924, ARRAY['Консультация фармацевта', 'Измерение давления'], true, false, '{"monday": {"open": "09:00", "close": "21:00"}}'),
('ЭкоЛайф Сокольники', 'ул. Сокольническая, 8', 'Москва', '+7 (495) 345-67-89', 55.7887, 37.6693, ARRAY['Консультация фармацевта', 'Доставка'], false, false, '{"monday": {"open": "08:30", "close": "20:30"}}'),
('ЭкоЛайф Екатеринбург', 'ул. Ленина, 12', 'Екатеринбург', '+7 (343) 456-78-90', 56.8431, 60.6454, ARRAY['Консультация фармацевта', 'Измерение давления', 'Анализы'], true, false, '{"monday": {"open": "08:00", "close": "22:00"}}')
ON CONFLICT DO NOTHING;

-- Обновление поискового вектора для товаров
UPDATE products SET search_vector = to_tsvector('russian', name || ' ' || COALESCE(description, '') || ' ' || COALESCE(brand, ''));
`;

async function initializeDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Начинаем инициализацию базы данных...');
    
    // Создание таблиц
    console.log('📋 Создание таблиц...');
    await client.query(createTablesSQL);
    console.log('✅ Таблицы созданы успешно');
    
    // Вставка тестовых данных
    console.log('📊 Добавление тестовых данных...');
    await client.query(insertTestDataSQL);
    console.log('✅ Тестовые данные добавлены успешно');
    
    console.log('🎉 База данных инициализирована успешно!');
    
  } catch (error) {
    console.error('❌ Ошибка при инициализации базы данных:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Запуск инициализации
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('✨ Готово! Можно запускать приложение.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Критическая ошибка:', error);
      process.exit(1);
    });
}

module.exports = { initializeDatabase }; 