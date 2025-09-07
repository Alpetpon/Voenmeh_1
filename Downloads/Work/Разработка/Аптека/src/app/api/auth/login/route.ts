import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, generateTokens, isValidEmail } from '@/lib/auth';

interface LoginRequest {
  email: string;
  password: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    const { email, password } = body;

    // Валидация обязательных полей
    if (!email || !password) {
      return NextResponse.json({
        success: false,
        message: 'Email и пароль обязательны'
      }, { status: 400 });
    }

    // Валидация email
    if (!isValidEmail(email)) {
      return NextResponse.json({
        success: false,
        message: 'Некорректный email адрес'
      }, { status: 400 });
    }

    // Аутентификация пользователя
    const user = await authenticateUser(email, password);

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Неверный email или пароль'
      }, { status: 401 });
    }

    // Генерация токенов
    const tokens = generateTokens(user);

    return NextResponse.json({
      success: true,
      message: 'Вход выполнен успешно',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        },
        ...tokens
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    }, { status: 500 });
  }
} 