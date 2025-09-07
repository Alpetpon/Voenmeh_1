import { Pool } from 'pg';

// Конфигурация базы данных
const dbConfig = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'ecolife_pharmacy',
  password: process.env.DB_PASSWORD || 'password',
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
};

// Пул соединений
const pool = new Pool(dbConfig);

// Функция для выполнения запросов
export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Query executed', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Функция для получения клиента из пула
export const getClient = async () => {
  return await pool.connect();
};

// Проверка подключения к базе данных
export const testConnection = async () => {
  try {
    const client = await getClient();
    await client.query('SELECT NOW()');
    client.release();
    console.log('Database connection successful');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
};

// SQL скрипты для инициализации базы данных
export const initializeTables = async () => {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');
    
    // Таблица категорий
    await client.query(`
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
      )
    `);

    // Таблица товаров
    await client.query(`
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
      )
    `);

    // Таблица аптек
    await client.query(`
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
      )
    `);

    // Таблица пользователей
    await client.query(`
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
      )
    `);

    // Таблица записей на консультации
    await client.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        store_id INTEGER REFERENCES stores(id),
        appointment_date DATE NOT NULL,
        appointment_time TIME NOT NULL,
        service_type VARCHAR(100) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        notes TEXT,
        pharmacist_name VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Индексы для поиска
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_products_search 
      ON products USING GIN(search_vector)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_products_category 
      ON products(category_id)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_stores_location 
      ON stores(latitude, longitude)
    `);

    await client.query('COMMIT');
    console.log('Database tables initialized successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error initializing tables:', error);
    throw error;
  } finally {
    client.release();
  }
};

export default pool; 