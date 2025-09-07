import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface CatalogProduct {
  id: number;
  name: string;
  slug: string;
  description?: string;
  price: number;
  oldPrice?: number;
  brand?: string;
  form?: string;
  prescriptionRequired: boolean;
  inStock: boolean;
  images: string[];
  rating: number;
  reviewsCount: number;
  isDiscounted: boolean;
  category: {
    id: number;
    name: string;
    slug: string;
  };
}

interface ProductFilters {
  category?: string;
  brand?: string;
  form?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  prescriptionRequired?: boolean;
  isDiscounted?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'price' | 'rating' | 'date';
  sortOrder?: 'asc' | 'desc';
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const filters: ProductFilters = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '12'),
      sortBy: (searchParams.get('sortBy') as 'name' | 'price' | 'rating' | 'date') || 'name',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'asc'
    };

    // Добавляем фильтры только если они существуют
    const category = searchParams.get('category');
    if (category) filters.category = category;

    const brand = searchParams.get('brand');
    if (brand) filters.brand = brand;

    const form = searchParams.get('form');
    if (form) filters.form = form;

    const minPrice = searchParams.get('minPrice');
    if (minPrice) filters.minPrice = parseFloat(minPrice);

    const maxPrice = searchParams.get('maxPrice');
    if (maxPrice) filters.maxPrice = parseFloat(maxPrice);

    if (searchParams.get('inStock') === 'true') {
      filters.inStock = true;
    }

    if (searchParams.get('prescriptionRequired') === 'true') {
      filters.prescriptionRequired = true;
    }

    if (searchParams.get('isDiscounted') === 'true') {
      filters.isDiscounted = true;
    }

    // Строим основной запрос
    let baseQuery = `
      SELECT 
        p.id,
        p.name,
        p.slug,
        p.description,
        p.price,
        p.old_price,
        p.brand,
        p.form,
        p.prescription_required,
        p.in_stock,
        p.images,
        p.rating,
        p.reviews_count,
        CASE WHEN p.old_price IS NOT NULL AND p.old_price > p.price THEN true ELSE false END as is_discounted,
        c.id as category_id,
        c.name as category_name,
        c.slug as category_slug,
        COUNT(*) OVER() as total_count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = true
    `;

    const params: any[] = [];
    let paramIndex = 1;

    // Добавляем фильтры
    if (filters.category) {
      baseQuery += ` AND c.slug = $${paramIndex}`;
      params.push(filters.category);
      paramIndex++;
    }

    if (filters.brand) {
      baseQuery += ` AND p.brand = $${paramIndex}`;
      params.push(filters.brand);
      paramIndex++;
    }

    if (filters.form) {
      baseQuery += ` AND p.form = $${paramIndex}`;
      params.push(filters.form);
      paramIndex++;
    }

    if (filters.minPrice !== undefined) {
      baseQuery += ` AND p.price >= $${paramIndex}`;
      params.push(filters.minPrice);
      paramIndex++;
    }

    if (filters.maxPrice !== undefined) {
      baseQuery += ` AND p.price <= $${paramIndex}`;
      params.push(filters.maxPrice);
      paramIndex++;
    }

    if (filters.inStock) {
      baseQuery += ` AND p.in_stock = true`;
    }

    if (filters.prescriptionRequired !== undefined) {
      baseQuery += ` AND p.prescription_required = $${paramIndex}`;
      params.push(filters.prescriptionRequired);
      paramIndex++;
    }

    if (filters.isDiscounted) {
      baseQuery += ` AND p.old_price IS NOT NULL AND p.old_price > p.price`;
    }

    // Добавляем сортировку
    let orderBy = '';
    switch (filters.sortBy) {
      case 'price':
        orderBy = `p.price ${filters.sortOrder?.toUpperCase()}`;
        break;
      case 'rating':
        orderBy = `p.rating ${filters.sortOrder?.toUpperCase()} NULLS LAST`;
        break;
      case 'date':
        orderBy = `p.created_at ${filters.sortOrder?.toUpperCase()}`;
        break;
      default:
        orderBy = `p.name ${filters.sortOrder?.toUpperCase()}`;
    }

    baseQuery += ` ORDER BY ${orderBy}`;

    // Добавляем пагинацию
    const offset = ((filters.page || 1) - 1) * (filters.limit || 12);
    baseQuery += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(filters.limit, offset);

    const result = await query(baseQuery, params);

    const products: CatalogProduct[] = result.rows.map((row: any) => {
      const product: CatalogProduct = {
        id: row.id as number,
        name: row.name as string,
        slug: row.slug as string,
        price: parseFloat(row.price),
        prescriptionRequired: row.prescription_required as boolean,
        inStock: row.in_stock as boolean,
        images: (row.images as string[]) || [],
        rating: row.rating ? parseFloat(row.rating) : 0,
        reviewsCount: (row.reviews_count as number) || 0,
        isDiscounted: row.is_discounted as boolean,
        category: {
          id: row.category_id as number,
          name: (row.category_name as string) || '',
          slug: (row.category_slug as string) || ''
        }
      };

      // Добавляем опциональные поля
      if (row.description) {
        product.description = row.description as string;
      }
      if (row.old_price) {
        product.oldPrice = parseFloat(row.old_price);
      }
      if (row.brand) {
        product.brand = row.brand as string;
      }
      if (row.form) {
        product.form = row.form as string;
      }

      return product;
    });

    const totalCount = result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0;
    const totalPages = Math.ceil(totalCount / (filters.limit || 12));

    // Получаем также доступные фильтры для сайдбара
    const filtersQuery = `
      SELECT 
        array_agg(DISTINCT p.brand) FILTER (WHERE p.brand IS NOT NULL) as brands,
        array_agg(DISTINCT p.form) FILTER (WHERE p.form IS NOT NULL) as forms,
        MIN(p.price) as min_price,
        MAX(p.price) as max_price
      FROM products p
      WHERE p.is_active = true
    `;

    const filtersResult = await query(filtersQuery);
    const availableFilters = filtersResult.rows[0];

    return NextResponse.json({
      success: true,
      data: {
        products,
        pagination: {
          page: filters.page || 1,
          limit: filters.limit || 12,
          total: totalCount,
          totalPages,
          hasNextPage: (filters.page || 1) < totalPages,
          hasPrevPage: (filters.page || 1) > 1
        },
        filters: {
          brands: availableFilters.brands || [],
          forms: availableFilters.forms || [],
          priceRange: {
            min: availableFilters.min_price ? parseFloat(availableFilters.min_price) : 0,
            max: availableFilters.max_price ? parseFloat(availableFilters.max_price) : 0
          }
        },
        appliedFilters: filters
      }
    });

  } catch (error) {
    console.error('Products API error:', error);
    return NextResponse.json({
      success: false,
      message: 'Ошибка при получении товаров'
    }, { status: 500 });
  }
} 