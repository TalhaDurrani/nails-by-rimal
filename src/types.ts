export interface ProductType {
  product_id: string;
  title: string;
  description: string;
  price: number;
  base_price?: number;
  image?: string;
  stock: number;
  sku?: string;
  category_id?: number;
  is_featured?: boolean;
  is_new?: boolean;
  is_published?: boolean;
  variants?: ProductVariantType[];
  created_at?: string;
  updated_at?: string;
}

export interface StoreOption {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  image_url?: string | null;
}

export interface StoreBundle {
  id: string;
  name: string;
  description: string;
  discount_percentage: number;
  expires_at?: string | null;
  products: ProductType[];
}

export interface ProductVariantType {
  id: number;
  product_id: string;
  shape_id: number;
  length_id: number;
  finish_id: number;
  stock_quantity: number;
  price_override?: number;
  sku?: string;
  shape?: ShapeType;
  length?: LengthType;
  finish?: FinishType;
  created_at: string;
  updated_at: string;
}

export interface ShapeType {
  id: number;
  name: string;
  is_active: boolean;
  created_at: string;
}

export interface LengthType {
  id: number;
  name: string;
  is_active: boolean;
  created_at: string;
}

export interface FinishType {
  id: number;
  name: string;
  swatch_hex?: string;
  is_active: boolean;
  created_at: string;
}

export interface CartItemType {
  id: number;
  cart_id: number;
  product_variant_id: number;
  quantity: number;
  created_at: string;
  updated_at: string;
  variant?: ProductVariantType & { product?: ProductType };
}

export type CartStatus = "active" | "abandoned" | "converted";

export interface CartType {
  id: number;
  user_id: string;
  status: CartStatus;
  created_at: string;
  updated_at: string;
  total_items: number;
  total_price: number;
  cart_items?: CartItemType[];
}

export interface OrderItemType {
  id: number;
  order_id: number;
  quantity: number;
  price_at_purchase: number;
  product_variant_id: number;
  bundle_id?: string | null;
  bundle_name?: string | null;
  bundle_discount?: number | null;
  variant?: ProductVariantType & { product?: ProductType };
}

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface OrderType {
  id: number;
  order_number: string;
  user_id: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  address_street: string;
  address_city: string;
  address_postal_code: string;
  address_province: string;
  status: OrderStatus;
  subtotal: number;
  shipping_fee: number;
  total: number;
  payment_method: string;
  box_option_id?: string | null;
  box_option_name?: string | null;
  box_option_price?: number;
  gift_packing_id?: string | null;
  gift_packing_name?: string | null;
  gift_packing_price?: number;
  gift_message?: string | null;
  payment_id?: string;
  created_at?: string;
  updated_at?: string;
  order_items?: OrderItemType[];
}

export interface AddressType {
  id: number;
  user_id: string;
  street: string;
  city: string;
  postal_code?: string;
  country: string;
  is_default: boolean;
}

export interface ProfileType {
  profile_id: string;
  username?: string;
  avatar_url?: string;
  email?: string;
  role: "admin" | "user";
  created_at: string;
  updated_at?: string;
}

export interface ReviewType {
  id: number;
  product_id: string;
  user_id: string;
  rating: number;
  comment?: string;
  created_at?: string;
}

export interface CategoryType {
  id: number;
  name: string;
  description: string;
  parent_id?: number;
}
