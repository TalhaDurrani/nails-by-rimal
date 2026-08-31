import 'server-only';

import { createAdminSupabase } from '@/lib/supabase/admin';

export interface CheckoutCustomer {
  name: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  postalCode: string;
  province: string;
}

export interface CheckoutItem {
  variantId: number;
  quantity: number;
  bundleId?: string;
  bundleKey?: string;
}

export interface CheckoutExtras {
  boxOptionId?: string;
  giftPackingId?: string;
  giftMessage?: string;
}

export interface CreatedOrder {
  orderId: number;
  trackingId: string;
  subtotal: number;
  shippingFee: number;
  total: number;
}

export async function createOrderService(
  requestKey: string,
  customer: CheckoutCustomer,
  items: CheckoutItem[],
  clientKey: string,
  userId: string | null,
  extras: CheckoutExtras,
): Promise<CreatedOrder> {
  const supabase = createAdminSupabase();
  const { data, error } = await supabase.rpc('place_order', {
    p_request_key: requestKey,
    p_customer_name: customer.name,
    p_customer_email: customer.email,
    p_customer_phone: customer.phone,
    p_address_street: customer.street,
    p_address_city: customer.city,
    p_address_postal_code: customer.postalCode,
    p_address_province: customer.province,
    p_items: items.map((item) => ({
      variant_id: item.variantId,
      quantity: item.quantity,
      bundle_id: item.bundleId ?? null,
      bundle_key: item.bundleKey ?? null,
    })),
    p_client_key: clientKey,
    p_user_id: userId,
    p_box_option_id: extras.boxOptionId ?? null,
    p_gift_packing_id: extras.giftPackingId ?? null,
    p_gift_message: extras.giftMessage?.trim() || null,
  });

  if (error) {
    console.error('Atomic order creation failed:', error);
    if (/stock|unavailable/i.test(error.message)) {
      throw new Error('One or more items are no longer available in that quantity.');
    }
    if (/too many/i.test(error.message)) {
      throw new Error('Please wait a few minutes before placing another order.');
    }
    throw new Error('We could not place your order. Please try again.');
  }

  const result = data as Record<string, unknown> | null;
  if (!result?.tracking_id || !result.order_id) {
    throw new Error('The order service returned an invalid response.');
  }

  return {
    orderId: Number(result.order_id),
    trackingId: String(result.tracking_id),
    subtotal: Number(result.subtotal ?? 0),
    shippingFee: Number(result.shipping_fee ?? 0),
    total: Number(result.total ?? 0),
  };
}
