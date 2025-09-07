import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface StoreLocation {
  id: number;
  name: string;
  address: string;
  city: string;
  phone?: string;
  email?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  workingHours: any;
  services: string[];
  hasParking: boolean;
  is24h: boolean;
  isActive: boolean;
  distance?: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const radius = parseFloat(searchParams.get('radius') || '10'); // в километрах
    const service = searchParams.get('service');
    const is24h = searchParams.get('is24h') === 'true';
    const hasParking = searchParams.get('hasParking') === 'true';

    let storesQuery = `
      SELECT 
        s.id,
        s.name,
        s.address,
        s.city,
        s.phone,
        s.email,
        s.latitude,
        s.longitude,
        s.working_hours,
        s.services,
        s.has_parking,
        s.is_24h,
        s.is_active
    `;

    // Если переданы координаты, вычисляем расстояние
    if (lat && lng) {
      storesQuery += `,
        (6371 * acos(
          cos(radians(${parseFloat(lat)})) * 
          cos(radians(s.latitude)) * 
          cos(radians(s.longitude) - radians(${parseFloat(lng)})) + 
          sin(radians(${parseFloat(lat)})) * 
          sin(radians(s.latitude))
        )) as distance
      `;
    }

    storesQuery += `
      FROM stores s
      WHERE s.is_active = true
    `;

    const params: any[] = [];
    let paramIndex = 1;

    // Фильтр по городу
    if (city) {
      storesQuery += ` AND LOWER(s.city) = LOWER($${paramIndex})`;
      params.push(city);
      paramIndex++;
    }

    // Фильтр по радиусу (если переданы координаты)
    if (lat && lng) {
      storesQuery += ` AND (6371 * acos(
        cos(radians($${paramIndex})) * 
        cos(radians(s.latitude)) * 
        cos(radians(s.longitude) - radians($${paramIndex + 1})) + 
        sin(radians($${paramIndex})) * 
        sin(radians(s.latitude))
      )) <= $${paramIndex + 2}`;
      params.push(parseFloat(lat), parseFloat(lng), radius);
      paramIndex += 3;
    }

    // Фильтр по услугам
    if (service) {
      storesQuery += ` AND $${paramIndex} = ANY(s.services)`;
      params.push(service);
      paramIndex++;
    }

    // Фильтр по круглосуточной работе
    if (is24h) {
      storesQuery += ` AND s.is_24h = true`;
    }

    // Фильтр по наличию парковки
    if (hasParking) {
      storesQuery += ` AND s.has_parking = true`;
    }

    // Сортировка по расстоянию, если координаты переданы
    if (lat && lng) {
      storesQuery += ' ORDER BY distance ASC';
    } else {
      storesQuery += ' ORDER BY s.name ASC';
    }

    const result = await query(storesQuery, params);

    const stores: StoreLocation[] = result.rows.map((row: any) => {
      const store: StoreLocation = {
        id: row.id as number,
        name: row.name as string,
        address: row.address as string,
        city: row.city as string,
        coordinates: {
          lat: row.latitude ? parseFloat(row.latitude) : 0,
          lng: row.longitude ? parseFloat(row.longitude) : 0
        },
        workingHours: row.working_hours || {},
        services: (row.services as string[]) || [],
        hasParking: row.has_parking as boolean,
        is24h: row.is_24h as boolean,
        isActive: row.is_active as boolean
      };

      // Добавляем опциональные поля
      if (row.phone) {
        store.phone = row.phone as string;
      }
      if (row.email) {
        store.email = row.email as string;
      }
      if (row.distance !== undefined) {
        store.distance = parseFloat(row.distance);
      }

      return store;
    });

    // Получаем также список доступных городов и услуг
    const citiesQuery = `
      SELECT DISTINCT city
      FROM stores
      WHERE is_active = true
      ORDER BY city ASC
    `;

    const servicesQuery = `
      SELECT DISTINCT unnest(services) as service
      FROM stores
      WHERE is_active = true AND services IS NOT NULL
      ORDER BY service ASC
    `;

    const [citiesResult, servicesResult] = await Promise.all([
      query(citiesQuery),
      query(servicesQuery)
    ]);

    const cities = citiesResult.rows.map((row: any) => row.city as string);
    const services = servicesResult.rows.map((row: any) => row.service as string);

    return NextResponse.json({
      success: true,
      data: {
        stores,
        total: stores.length,
        filters: {
          cities,
          services
        },
        appliedFilters: {
          city,
          lat: lat ? parseFloat(lat) : undefined,
          lng: lng ? parseFloat(lng) : undefined,
          radius,
          service,
          is24h,
          hasParking
        }
      }
    });

  } catch (error) {
    console.error('Stores API error:', error);
    return NextResponse.json({
      success: false,
      message: 'Ошибка при получении списка аптек'
    }, { status: 500 });
  }
} 