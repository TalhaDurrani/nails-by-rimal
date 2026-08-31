import type {
  FinishType,
  LengthType,
  ProductType,
  ProductVariantType,
  ShapeType,
} from '@/types';

export const PRODUCT_SELECT = `
  *,
  category:categories(*),
  variants:product_variants(
    *,
    shape:shapes(*),
    length:lengths(*),
    finish:finishes(*)
  )
`;

type Relation<T> = T | T[] | null | undefined;

function one<T>(value: Relation<T>): T | undefined {
  return Array.isArray(value) ? value[0] : value ?? undefined;
}

type DataRecord = Record<string, unknown>;

export function mapVariantRecord(record: DataRecord): ProductVariantType {
  return {
    id: Number(record.id),
    product_id: String(record.product_id),
    shape_id: Number(record.shape_id),
    length_id: Number(record.length_id),
    finish_id: Number(record.finish_id),
    stock_quantity: Number(record.stock_quantity ?? 0),
    price_override:
      record.price_override === null || record.price_override === undefined
        ? undefined
        : Number(record.price_override),
    sku: record.sku == null ? undefined : String(record.sku),
    shape: one<ShapeType>((record.shape ?? record.shapes) as Relation<ShapeType>),
    length: one<LengthType>((record.length ?? record.lengths) as Relation<LengthType>),
    finish: one<FinishType>((record.finish ?? record.finishes) as Relation<FinishType>),
    created_at: String(record.created_at ?? ''),
    updated_at: String(record.updated_at ?? ''),
  };
}

export function mapProductRecord(record: DataRecord): ProductType {
  const variants = Array.isArray(record.variants)
    ? record.variants.map((variant) => mapVariantRecord(variant as DataRecord))
    : [];
  const basePrice = Number(record.base_price ?? record.price ?? 0);

  return {
    ...record,
    product_id: String(record.product_id),
    title: String(record.title),
    description: String(record.description ?? ''),
    base_price: basePrice,
    price: basePrice,
    image: record.image == null ? undefined : String(record.image),
    stock: variants.reduce(
      (sum: number, variant: ProductVariantType) =>
        sum + variant.stock_quantity,
      0,
    ),
    variants,
  };
}
