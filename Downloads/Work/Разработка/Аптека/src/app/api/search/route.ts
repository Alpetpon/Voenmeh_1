import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// Интерфейс для результатов поиска (упрощенная версия Product)
interface SearchProduct {
  id: number;
  name: string;
  slug: string;
  price: number;
  oldPrice?: number;
  brand?: string;
  form?: string;
  prescriptionRequired: boolean;
  inStock: boolean;
  images: string[];
  rating: number;
  reviewsCount: number;
  category: {
    name: string;
    slug: string;
  };
}

// Тестовые данные для демонстрации
const mockProducts: SearchProduct[] = [
  {
    id: 1,
    name: "Аспирин 500мг",
    slug: "aspirin-500mg",
    price: 89.50,
    oldPrice: 120,
    brand: "Bayer",
    form: "таблетки",
    prescriptionRequired: false,
    inStock: true,
    images: ["/images/products/aspirin.jpg"],
    rating: 4.5,
    reviewsCount: 124,
    category: { name: "Анальгетики", slug: "analgesics" }
  },
  {
    id: 2,
    name: "Анальгин 500мг",
    slug: "analgin-500mg",
    price: 45.00,
    brand: "Фармстандарт",
    form: "таблетки",
    prescriptionRequired: false,
    inStock: true,
    images: ["/images/products/analgin.jpg"],
    rating: 4.2,
    reviewsCount: 89,
    category: { name: "Анальгетики", slug: "analgesics" }
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');

    if (!q || q.length < 2) {
      return NextResponse.json({
        success: false,
        message: 'Минимальная длина запроса - 2 символа'
      }, { status: 400 });
    }

    try {
      // Пытаемся подключиться к базе данных
      let searchQuery = `
        SELECT 
          p.id,
          p.name,
          p.slug,
          p.price,
          p.old_price,
          p.brand,
          p.form,
          p.prescription_required,
          p.in_stock,
          p.images,
          p.rating,
          p.reviews_count,
          c.name as category_name,
          c.slug as category_slug,
          ts_rank(p.search_vector, plainto_tsquery('russian', $1)) as rank
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.is_active = true
          AND (
            p.search_vector @@ plainto_tsquery('russian', $1)
            OR p.name ILIKE $2
            OR p.brand ILIKE $2
            OR p.description ILIKE $2
          )
      `;

      const params = [q, `%${q}%`];
      let paramIndex = 3;

      if (category) {
        searchQuery += ` AND c.slug = $${paramIndex}`;
        params.push(category);
        paramIndex++;
      }

      searchQuery += `
        ORDER BY rank DESC, p.name ASC
        LIMIT $${paramIndex}
      `;
      params.push(limit.toString());

      const result = await query(searchQuery, params);

      const products: SearchProduct[] = result.rows.map((row: any) => {
        const product: SearchProduct = {
          id: row.id as number,
          name: row.name as string,
          slug: row.slug as string,
          price: parseFloat(row.price),
          prescriptionRequired: row.prescription_required as boolean,
          inStock: row.in_stock as boolean,
          images: (row.images as string[]) || [],
          rating: row.rating ? parseFloat(row.rating) : 0,
          reviewsCount: (row.reviews_count as number) || 0,
          category: {
            name: (row.category_name as string) || '',
            slug: (row.category_slug as string) || ''
          }
        };

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

      const suggestionsQuery = `
        SELECT DISTINCT name
        FROM products
        WHERE name ILIKE $1 
          AND is_active = true
        ORDER BY name ASC
        LIMIT 5
      `;

      const suggestionsResult = await query(suggestionsQuery, [`%${q}%`]);
      const suggestions = suggestionsResult.rows.map((row: any) => row.name as string);

      return NextResponse.json({
        success: true,
        data: {
          products,
          suggestions,
          total: products.length,
          query: q
        }
      });

    } catch (dbError) {
      // Fallback на тестовые данные если БД недоступна
      console.warn('Database unavailable, using mock data:', dbError);
      
      const filteredProducts = mockProducts.filter(product => 
        product.name.toLowerCase().includes(q.toLowerCase()) ||
        (product.brand && product.brand.toLowerCase().includes(q.toLowerCase()))
      ).slice(0, limit);

      const suggestions = mockProducts
        .filter(product => product.name.toLowerCase().includes(q.toLowerCase()))
        .map(product => product.name)
        .slice(0, 5);

      return NextResponse.json({
        success: true,
        data: {
          products: filteredProducts,
          suggestions,
          total: filteredProducts.length,
          query: q
        },
        message: 'Используются тестовые данные (база данных недоступна)'
      });
    }

  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({
      success: false,
      message: 'Ошибка при выполнении поиска'
    }, { status: 500 });
  }
} 