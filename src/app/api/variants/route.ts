import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';

// GET /api/variants?ids=1,2,3
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const idsParam = searchParams.get('ids');

  if (!idsParam) {
    return NextResponse.json(
      { error: 'Missing required parameter: ids' },
      { status: 400 }
    );
  }

  const ids = idsParam.split(',').map((id) => Number(id.trim()));
  const validIds = Array.from(
    new Set(ids.filter((id) => Number.isSafeInteger(id) && id > 0)),
  );

  if (validIds.length === 0) {
    return NextResponse.json(
      { error: 'No valid variant IDs provided' },
      { status: 400 }
    );
  }

  if (validIds.length > 50) {
    return NextResponse.json(
      { error: 'A maximum of 50 variant IDs may be requested' },
      { status: 400 },
    );
  }

  try {
    // The publishable client intentionally keeps product publication RLS active.
    const supabase = await createServerSupabase();

    const { data, error } = await supabase
      .from('product_variants')
      .select(`
        id,
        product_id,
        shape_id,
        length_id,
        finish_id,
        stock_quantity,
        price_override,
        products (
          title,
          base_price,
          is_published
        ),
        shapes (
          name
        ),
        lengths (
          name
        ),
        finishes (
          name,
          swatch_hex
        )
      `)
      .in('id', validIds);

    if (error) {
      console.error('Error fetching variants:', error);
      return NextResponse.json(
        { error: 'Failed to fetch variants' },
        { status: 500 }
      );
    }

    // Format the response
    const variants = data.map((variant) => {
      const relation = <T,>(value: T | T[] | null): T | undefined =>
        Array.isArray(value) ? value[0] : value ?? undefined;
      const shapeRecord = relation(variant.shapes);
      const lengthRecord = relation(variant.lengths);
      const finishRecord = relation(variant.finishes);
      const product = relation(variant.products);
      const shape = shapeRecord?.name || 'Unknown';
      const length = lengthRecord?.name || 'Unknown';
      const finish = finishRecord?.name || 'Unknown';

      return {
        id: variant.id,
        productId: variant.product_id,
        shape,
        length,
        finish,
        finishColor: finishRecord?.swatch_hex,
        stockQuantity: variant.stock_quantity,
        priceOverride: variant.price_override,
        basePrice: product?.base_price,
        isPublished: product?.is_published,
        finalPrice: variant.price_override ?? product?.base_price ?? 0,
        displayName: `${product?.title} - ${shape} ${length} ${finish}`,
      };
    });

    return NextResponse.json({ variants });
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
