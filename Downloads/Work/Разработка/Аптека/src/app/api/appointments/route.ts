import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface CreateAppointmentRequest {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  storeId: number;
  serviceType: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // HH:MM
  notes?: string;
}

interface AppointmentResponse {
  id: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  storeId: number;
  storeName: string;
  storeAddress: string;
  serviceType: string;
  date: string;
  timeSlot: string;
  status: string;
  notes?: string;
  createdAt: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateAppointmentRequest = await request.json();
    const { 
      customerName, 
      customerPhone, 
      customerEmail, 
      storeId, 
      serviceType, 
      date, 
      timeSlot, 
      notes 
    } = body;

    // Валидация обязательных полей
    if (!customerName || !customerPhone || !storeId || !serviceType || !date || !timeSlot) {
      return NextResponse.json({
        success: false,
        message: 'Заполните все обязательные поля'
      }, { status: 400 });
    }

    // Проверка существования аптеки
    const storeCheck = await query(
      'SELECT id, name FROM stores WHERE id = $1 AND is_active = true',
      [storeId]
    );

    if (storeCheck.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Аптека не найдена'
      }, { status: 404 });
    }

    // Проверка доступности времени
    const timeCheck = await query(
      `SELECT id FROM appointments 
       WHERE store_id = $1 
         AND appointment_date = $2 
         AND appointment_time = $3 
         AND status != 'cancelled'`,
      [storeId, date, timeSlot]
    );

    if (timeCheck.rows.length > 0) {
      return NextResponse.json({
        success: false,
        message: 'Это время уже занято. Выберите другое время.'
      }, { status: 409 });
    }

    // Создание записи
    const result = await query(
      `INSERT INTO appointments (
         customer_name, customer_phone, customer_email, 
         store_id, service_type, appointment_date, 
         appointment_time, notes, status
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, created_at`,
      [
        customerName,
        customerPhone,
        customerEmail,
        storeId,
        serviceType,
        date,
        timeSlot,
        notes,
        'pending'
      ]
    );

    const appointment = result.rows[0];

    // Получаем информацию об аптеке для ответа
    const storeInfo = await query(
      'SELECT name, address FROM stores WHERE id = $1',
      [storeId]
    );

    const responseData: AppointmentResponse = {
      id: appointment.id,
      customerName,
      customerPhone,
      storeId,
      storeName: storeInfo.rows[0].name,
      storeAddress: storeInfo.rows[0].address,
      serviceType,
      date,
      timeSlot,
      status: 'pending',
      createdAt: appointment.created_at
    };

    // Добавляем опциональные поля только если они существуют
    if (customerEmail) {
      responseData.customerEmail = customerEmail;
    }
    if (notes) {
      responseData.notes = notes;
    }

    return NextResponse.json({
      success: true,
      message: 'Запись успешно создана',
      data: responseData
    }, { status: 201 });

  } catch (error) {
    console.error('Create appointment error:', error);
    return NextResponse.json({
      success: false,
      message: 'Ошибка при создании записи'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');
    const date = searchParams.get('date');
    const status = searchParams.get('status');

    let appointmentsQuery = `
      SELECT 
        a.id,
        a.customer_name,
        a.customer_phone,
        a.customer_email,
        a.store_id,
        a.service_type,
        a.appointment_date,
        a.appointment_time,
        a.status,
        a.notes,
        a.created_at,
        s.name as store_name,
        s.address as store_address
      FROM appointments a
      LEFT JOIN stores s ON a.store_id = s.id
      WHERE 1=1
    `;

    const params: (string | number)[] = [];
    let paramIndex = 1;

    if (storeId) {
      appointmentsQuery += ` AND a.store_id = $${paramIndex}`;
      params.push(parseInt(storeId));
      paramIndex++;
    }

    if (date) {
      appointmentsQuery += ` AND a.appointment_date = $${paramIndex}`;
      params.push(date);
      paramIndex++;
    }

    if (status) {
      appointmentsQuery += ` AND a.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    appointmentsQuery += ' ORDER BY a.appointment_date DESC, a.appointment_time DESC';

    const result = await query(appointmentsQuery, params);

    const appointments: AppointmentResponse[] = result.rows.map((row: Record<string, unknown>) => ({
      id: row.id as number,
      customerName: row.customer_name as string,
      customerPhone: row.customer_phone as string,
      customerEmail: row.customer_email as string,
      storeId: row.store_id as number,
      storeName: row.store_name as string,
      storeAddress: row.store_address as string,
      serviceType: row.service_type as string,
      date: row.appointment_date as string,
      timeSlot: row.appointment_time as string,
      status: row.status as string,
      notes: row.notes as string,
      createdAt: row.created_at as string
    }));

    return NextResponse.json({
      success: true,
      data: {
        appointments,
        total: appointments.length
      }
    });

  } catch (error) {
    console.error('Get appointments error:', error);
    return NextResponse.json({
      success: false,
      message: 'Ошибка при получении записей'
    }, { status: 500 });
  }
} 