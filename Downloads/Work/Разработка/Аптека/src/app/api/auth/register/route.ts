import { NextRequest, NextResponse } from 'next/server';
import { createUser, generateTokens, isValidEmail, isValidPassword } from '@/lib/auth';

interface RegisterRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequest = await request.json();
    const { email, password, firstName, lastName, phone } = body;

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

    // Валидация пароля
    const passwordValidation = isValidPassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json({
        success: false,
        message: 'Пароль не соответствует требованиям',
        errors: passwordValidation.errors
      }, { status: 400 });
    }

    // Создание пользователя
    const user = await createUser(email, password, firstName, lastName, phone);

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Ошибка при создании пользователя'
      }, { status: 500 });
    }

    // Генерация токенов
    const tokens = generateTokens(user);

    return NextResponse.json({
      success: true,
      message: 'Пользователь успешно зарегистрирован',
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
    }, { status: 201 });

  } catch (error: any) {
    console.error('Registration error:', error);

    if (error.message === 'Пользователь с таким email уже существует') {
      return NextResponse.json({
        success: false,
        message: error.message
      }, { status: 409 });
    }

    return NextResponse.json({
      success: false,
      message: 'Внутренняя ошибка сервера'
    }, { status: 500 });
  }
} 