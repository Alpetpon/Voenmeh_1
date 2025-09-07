import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

export interface UserPayload {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// Хэширование пароля
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

// Проверка пароля
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

// Генерация JWT токенов
export const generateTokens = (payload: UserPayload): AuthTokens => {
  const accessToken = jwt.sign(
    payload,
    JWT_SECRET
  );

  const refreshToken = jwt.sign(
    { id: payload.id, type: 'refresh' },
    JWT_SECRET
  );

  return { accessToken, refreshToken };
};

// Верификация токена
export const verifyToken = (token: string): UserPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'ecolife-pharmacy',
      audience: 'ecolife-users'
    }) as UserPayload;
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
};

// Создание пользователя
export const createUser = async (
  email: string,
  password: string,
  firstName?: string,
  lastName?: string,
  phone?: string
): Promise<UserPayload | null> => {
  try {
    // Проверяем, существует ли пользователь
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      throw new Error('Пользователь с таким email уже существует');
    }

    const hashedPassword = await hashPassword(password);

    const result = await query(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, first_name, last_name, role`,
      [email, hashedPassword, firstName, lastName, phone, 'customer']
    );

    const user = result.rows[0];
    return {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role
    };
  } catch (error) {
    console.error('Create user error:', error);
    throw error;
  }
};

// Аутентификация пользователя
export const authenticateUser = async (
  email: string,
  password: string
): Promise<UserPayload | null> => {
  try {
    const result = await query(
      'SELECT id, email, password_hash, first_name, last_name, role FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const user = result.rows[0];
    const isValidPassword = await verifyPassword(password, user.password_hash);

    if (!isValidPassword) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role
    };
  } catch (error) {
    console.error('Authenticate user error:', error);
    return null;
  }
};

// Получение пользователя по ID
export const getUserById = async (id: number): Promise<UserPayload | null> => {
  try {
    const result = await query(
      'SELECT id, email, first_name, last_name, role FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const user = result.rows[0];
    return {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role
    };
  } catch (error) {
    console.error('Get user by ID error:', error);
    return null;
  }
};

// Валидация email
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Валидация пароля
export const isValidPassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Пароль должен содержать минимум 8 символов');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Пароль должен содержать минимум одну заглавную букву');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Пароль должен содержать минимум одну строчную букву');
  }

  if (!/\d/.test(password)) {
    errors.push('Пароль должен содержать минимум одну цифру');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Middleware для проверки авторизации
export const requireAuth = (handler: any) => {
  return async (request: Request) => {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ success: false, message: 'Требуется авторизация' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.substring(7);
    const user = verifyToken(token);

    if (!user) {
      return new Response(
        JSON.stringify({ success: false, message: 'Недействительный токен' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Добавляем пользователя в контекст запроса
    (request as any).user = user;
    
    return handler(request);
  };
}; 