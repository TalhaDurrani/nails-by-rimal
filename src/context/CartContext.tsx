'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { toast } from 'sonner';
import type { ProductType, ProductVariantType, StoreBundle } from '@/types';

const GUEST_CART_KEY = 'nails-by-rimal-cart-v3';
const LEGACY_GUEST_CART_KEY = 'nails-by-rimal-cart-v2';

export interface CartItem {
  line_id: string;
  product_id: string;
  product_variant_id: number;
  title: string;
  description: string;
  image?: string;
  price: number;
  original_price: number;
  stock: number;
  quantity: number;
  shape?: string;
  length?: string;
  finish?: string;
  bundle_id?: string;
  bundle_key?: string;
  bundle_name?: string;
  bundle_discount?: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (
    product: ProductType,
    variant?: ProductVariantType,
    quantity?: number,
  ) => Promise<void>;
  addBundleToCart: (
    bundle: StoreBundle,
    selections: ProductVariantType[],
  ) => Promise<void>;
  removeFromCart: (lineId: string | number) => Promise<void>;
  updateQuantity: (lineId: string | number, amount: number) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  subtotal: number;
  savings: number;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function normalLineId(variantId: number) {
  return `variant:${variantId}`;
}

function variantToCartItem(
  product: ProductType,
  variant: ProductVariantType,
  quantity: number,
): CartItem {
  const price = Number(variant.price_override ?? product.price);
  return {
    line_id: normalLineId(variant.id),
    product_id: product.product_id,
    product_variant_id: variant.id,
    title: product.title,
    description: product.description,
    image: product.image,
    price,
    original_price: price,
    stock: variant.stock_quantity,
    quantity,
    shape: variant.shape?.name,
    length: variant.length?.name,
    finish: variant.finish?.name,
  };
}

function isValidCartItem(item: unknown): item is CartItem {
  if (!item || typeof item !== 'object') return false;
  const line = item as Partial<CartItem>;
  return (
    typeof line.line_id === 'string' &&
    typeof line.product_id === 'string' &&
    Number.isInteger(line.product_variant_id) &&
    Number.isInteger(line.quantity) &&
    Number(line.quantity) > 0 &&
    typeof line.price === 'number' &&
    typeof line.original_price === 'number' &&
    typeof line.stock === 'number'
  );
}

function readGuestCart(): CartItem[] {
  try {
    const current = JSON.parse(localStorage.getItem(GUEST_CART_KEY) || '[]');
    if (Array.isArray(current) && current.length) return current.filter(isValidCartItem);

    const legacy = JSON.parse(localStorage.getItem(LEGACY_GUEST_CART_KEY) || '[]');
    if (!Array.isArray(legacy)) return [];
    const migrated = legacy.flatMap((value): CartItem[] => {
      const item = value as Partial<CartItem>;
      if (!Number.isInteger(item.product_variant_id) || !Number.isInteger(item.quantity)) return [];
      const price = Number(item.price);
      if (!Number.isFinite(price) || Number(item.quantity) < 1) return [];
      return [{
        ...item,
        line_id: normalLineId(Number(item.product_variant_id)),
        product_id: String(item.product_id || ''),
        product_variant_id: Number(item.product_variant_id),
        title: String(item.title || 'Product'),
        description: String(item.description || ''),
        price,
        original_price: price,
        stock: Number(item.stock || 0),
        quantity: Number(item.quantity),
      }];
    });
    localStorage.removeItem(LEGACY_GUEST_CART_KEY);
    return migrated.filter(isValidCartItem);
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setCartItems(readGuestCart());
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cartItems));
    }
  }, [cartItems, isLoading]);

  const addToCart = async (
    product: ProductType,
    requestedVariant?: ProductVariantType,
    quantity = 1,
  ) => {
    const variant =
      requestedVariant ?? product.variants?.find((item) => item.stock_quantity > 0);
    if (!variant || variant.stock_quantity < 1) {
      toast.error('This product has no available variant.');
      return;
    }
    if (!Number.isInteger(quantity) || quantity < 1) return;

    const lineId = normalLineId(variant.id);
    const currentQuantity =
      cartItems.find((item) => item.line_id === lineId)?.quantity ?? 0;
    if (currentQuantity + quantity > variant.stock_quantity) {
      toast.error('The requested quantity is not available.');
      return;
    }

    setCartItems((items) => {
      const existing = items.find((item) => item.line_id === lineId);
      return existing
        ? items.map((item) =>
            item.line_id === lineId
              ? { ...item, quantity: item.quantity + quantity }
              : item,
          )
        : [...items, variantToCartItem(product, variant, quantity)];
    });
    toast.success('Added to cart');
  };

  const addBundleToCart = async (
    bundle: StoreBundle,
    selections: ProductVariantType[],
  ) => {
    if (selections.length !== bundle.products.length) {
      toast.error('Choose an available option for every product in the bundle.');
      return;
    }
    if (selections.some((variant) => variant.stock_quantity < 1)) {
      toast.error('One of the selected bundle items is out of stock.');
      return;
    }

    const bundleKey = crypto.randomUUID();
    const multiplier = 1 - Number(bundle.discount_percentage) / 100;
    const lines = bundle.products.map((product, index): CartItem => {
      const variant = selections[index];
      const originalPrice = Number(variant.price_override ?? product.price);
      return {
        ...variantToCartItem(product, variant, 1),
        line_id: `bundle:${bundleKey}:${variant.id}`,
        price: Number((originalPrice * multiplier).toFixed(2)),
        original_price: originalPrice,
        bundle_id: bundle.id,
        bundle_key: bundleKey,
        bundle_name: bundle.name,
        bundle_discount: Number(bundle.discount_percentage),
      };
    });
    setCartItems((items) => [...items, ...lines]);
    toast.success(`${bundle.name} added to cart`);
  };

  const resolveLine = (items: CartItem[], id: string | number) =>
    items.find(
      (line) =>
        line.line_id === String(id) ||
        (!line.bundle_key && line.product_variant_id === Number(id)),
    );

  const removeFromCart = async (lineId: string | number) => {
    setCartItems((items) => {
      const item = resolveLine(items, lineId);
      if (!item) return items;
      return item.bundle_key
        ? items.filter((line) => line.bundle_key !== item.bundle_key)
        : items.filter((line) => line.line_id !== item.line_id);
    });
  };

  const updateQuantity = async (lineId: string | number, amount: number) => {
    setCartItems((items) => {
      const item = resolveLine(items, lineId);
      if (!item) return items;
      const nextQuantity = item.quantity + amount;
      if (nextQuantity <= 0) {
        return item.bundle_key
          ? items.filter((line) => line.bundle_key !== item.bundle_key)
          : items.filter((line) => line.line_id !== item.line_id);
      }

      const affected = item.bundle_key
        ? items.filter((line) => line.bundle_key === item.bundle_key)
        : [item];
      if (affected.some((line) => nextQuantity > line.stock)) {
        toast.error('No more stock is available for this selection.');
        return items;
      }
      return items.map((line) =>
        line.line_id === item.line_id ||
        (item.bundle_key && line.bundle_key === item.bundle_key)
          ? { ...line, quantity: nextQuantity }
          : line,
      );
    });
  };

  const clearCart = async () => {
    setCartItems([]);
    localStorage.removeItem(GUEST_CART_KEY);
    localStorage.removeItem(LEGACY_GUEST_CART_KEY);
  };

  const totals = useMemo(
    () => ({
      totalItems: cartItems.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      ),
      savings: cartItems.reduce(
        (sum, item) => sum + (item.original_price - item.price) * item.quantity,
        0,
      ),
    }),
    [cartItems],
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        addBundleToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        ...totals,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}
