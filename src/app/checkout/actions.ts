'use server'

import { createServerSupabase } from '@/lib/supabase/server'
import { OrderType, AddressType } from '@/types'

/**
 * Validate Pakistani province
 */
const VALID_PROVINCES = [
  'Punjab',
  'Sindh',
  'Khyber Pakhtunkhwa',
  'Balochistan',
  'Islamabad Capital Territory',
  'Gilgit-Baltistan',
  'Azad Kashmir',
]

interface CheckoutFormData {
  customerName: string
  customerPhone: string
  customerEmail?: string
  street: string
  city: string
  postalCode: string
  province: string
  cartItems: Array<{
    productVariantId: number
    quantity: number
  }>
}

interface CheckoutResult {
  success: boolean
  orderNumber?: string
  orderId?: number
  error?: string
}

/**
 * Create order with COD payment method
 * IMPORTANT: Prices are recomputed server-side — client prices are not trusted
 * 
 * Flow:
 * 1. Validate shipping address
 * 2. Look up each product_variant to get current price
 * 3. Recompute subtotal/total server-side
 * 4. Create order in database
 * 5. Return order_number for confirmation page
 */
export async function createCODOrder(
  data: CheckoutFormData
): Promise<CheckoutResult> {
  try {
    // ============================================
    // 1. VALIDATE INPUT
    // ============================================
    
    if (!data.customerName?.trim()) {
      return { success: false, error: 'Customer name is required' }
    }
    
    if (!data.customerPhone?.trim()) {
      return { success: false, error: 'Customer phone is required' }
    }
    
    if (!data.street?.trim() || !data.city?.trim() || !data.postalCode?.trim()) {
      return { success: false, error: 'Complete address is required' }
    }
    
    if (!VALID_PROVINCES.includes(data.province)) {
      return { success: false, error: 'Invalid province selected' }
    }
    
    if (!data.cartItems || data.cartItems.length === 0) {
      return { success: false, error: 'Cart is empty' }
    }

    const supabase = await createServerSupabase()

    // ============================================
    // 2. FETCH PRODUCT VARIANTS & COMPUTE PRICES
    // ============================================
    
    // Get all variant IDs from the request
    const variantIds = data.cartItems.map(item => item.productVariantId)
    
    // Fetch variants WITH their product base_price
    const { data: variants, error: variantError } = await supabase
      .from('product_variants')
      .select(`
        id,
        product_id,
        stock_quantity,
        price_override,
        products:product_id (
          base_price,
          is_published
        )
      `)
      .in('id', variantIds)
    
    if (variantError) {
      console.error('Error fetching variants:', variantError)
      return { success: false, error: 'Failed to fetch product details' }
    }
    
    if (!variants || variants.length === 0) {
      return { success: false, error: 'Products not found' }
    }

    // Build variant map for quick lookup
    const variantMap = new Map(
      (variants as any[]).map(v => [v.id, v])
    )

    // ============================================
    // 3. VALIDATE STOCK & COMPUTE ORDER TOTALS
    // ============================================
    
    let subtotal = 0
    const orderItems: Array<{
      product_variant_id: number
      quantity: number
      price_at_purchase: number
    }> = []

    for (const cartItem of data.cartItems) {
      const variant = variantMap.get(cartItem.productVariantId)
      
      if (!variant) {
        return {
          success: false,
          error: `Product variant ${cartItem.productVariantId} not found`,
        }
      }

      // Check product is published
      if (!variant.products?.is_published) {
        return {
          success: false,
          error: 'One or more products are not available',
        }
      }

      // Check stock
      if (variant.stock_quantity < cartItem.quantity) {
        return {
          success: false,
          error: `Insufficient stock for variant ${variant.id}. Available: ${variant.stock_quantity}`,
        }
      }

      // Calculate price for THIS variant
      // Use price_override if set, otherwise use product base_price
      const unitPrice = variant.price_override ?? variant.products.base_price
      
      if (!unitPrice || unitPrice <= 0) {
        return {
          success: false,
          error: `Invalid price for variant ${variant.id}`,
        }
      }

      const itemTotal = unitPrice * cartItem.quantity
      subtotal += itemTotal

      orderItems.push({
        product_variant_id: variant.id,
        quantity: cartItem.quantity,
        price_at_purchase: unitPrice,
      })
    }

    // ============================================
    // 4. ADD SHIPPING FEE
    // ============================================
    
    const shippingFee = 500 // Flat rate in PKR
    const total = subtotal + shippingFee

    // ============================================
    // 5. CREATE ORDER IN DATABASE
    // ============================================
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    // user_id can be null for guest checkout
    const userId = user?.id ?? null

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          user_id: userId,
          customer_name: data.customerName.trim(),
          customer_phone: data.customerPhone.trim(),
          customer_email: data.customerEmail?.trim() ?? null,
          address_street: data.street.trim(),
          address_city: data.city.trim(),
          address_postal_code: data.postalCode.trim(),
          address_province: data.province,
          subtotal,
          shipping_fee: shippingFee,
          total,
          status: 'pending',
          payment_method: 'cod',
        },
      ])
      .select()
      .single()

    if (orderError) {
      console.error('Error creating order:', orderError)
      return { success: false, error: 'Failed to create order' }
    }

    if (!order) {
      return { success: false, error: 'Order creation failed' }
    }

    // ============================================
    // 6. CREATE ORDER ITEMS
    // ============================================
    
    const itemsToInsert = orderItems.map(item => ({
      order_id: order.id,
      product_variant_id: item.product_variant_id,
      quantity: item.quantity,
      price_at_purchase: item.price_at_purchase,
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(itemsToInsert)

    if (itemsError) {
      console.error('Error creating order items:', itemsError)
      // Try to clean up the order
      await supabase.from('orders').delete().eq('id', order.id)
      return { success: false, error: 'Failed to create order items' }
    }

    // ============================================
    // 7. RETURN SUCCESS WITH ORDER NUMBER
    // ============================================
    
    return {
      success: true,
      orderNumber: order.order_number,
      orderId: order.id,
    }
  } catch (error) {
    console.error('Unexpected error in createCODOrder:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}
