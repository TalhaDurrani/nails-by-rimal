import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Generate a random 6-character alphanumeric string (e.g., NBR-A7B8C9)
const generateTrackingId = () => {
  const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `NBR-${randomStr}`;
};

export async function createOrderService(formData: any, cartItems: any[], cartTotal: number) {
  // FIX: Add 'await' here because cookies() is async in newer Next.js versions
  const cookieStore = await cookies(); 
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  const trackingId = generateTrackingId();

  // 1. Insert the Order
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      order_number: trackingId,
      customer_name: formData.name,
      customer_email: formData.email,
      customer_phone: formData.phone,
      address_street: formData.street,
      address_city: formData.city,
      address_postal_code: formData.zip,
      address_province: formData.province,
      total: cartTotal,
      subtotal: cartTotal,
      payment_method: "cod",
      status: "pending",
    })
    .select()
    .single();

  if (orderError) throw new Error("Failed to create order: " + orderError.message);

  // 2. Insert the Order Items
  const orderItemsData = cartItems.map((item) => ({
    order_id: order.id,
    product_id: item.product_id,
    product_variant_id: item.product_variant_id,
    quantity: item.quantity,
    price: item.price,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItemsData);

  if (itemsError) throw new Error("Failed to save order items: " + itemsError.message);

  return { trackingId, order };
}