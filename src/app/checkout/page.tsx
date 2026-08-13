'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { toast } from 'sonner'
import { createCODOrder } from './actions'
import { useGuestCart } from '@/context/GuestCartContext'
import { createServerSupabase } from '@/lib/supabase/server'

const PAKISTANI_PROVINCES = [
  'Punjab',
  'Sindh',
  'Khyber Pakhtunkhwa',
  'Balochistan',
  'Islamabad Capital Territory',
  'Gilgit-Baltistan',
  'Azad Kashmir',
]

interface CartItemWithDetails {
  productVariantId: number
  quantity: number
  productTitle?: string
  shapeName?: string
  lengthName?: string
  finishName?: string
  price?: number
}

export default function CheckoutPage() {
  const router = useRouter()
  const { cartItems, isHydrated } = useGuestCart()
  const [isLoading, setIsLoading] = useState(false)
  const [cartDetails, setCartDetails] = useState<CartItemWithDetails[]>([])
  const [subtotal, setSubtotal] = useState(0)
  
  // Form state
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    street: '',
    city: '',
    postalCode: '',
    province: 'Punjab',
  })

  // Load cart item details when cart items change
  useEffect(() => {
    const loadCartDetails = async () => {
      if (!isHydrated || cartItems.length === 0) {
        setCartDetails([])
        setSubtotal(0)
        return
      }

      try {
        // Fetch variant details from Supabase
        const variantIds = cartItems.map(item => item.productVariantId)
        
        const response = await fetch(
          `/api/variants?ids=${variantIds.join(',')}`
        )
        const variants = await response.json()

        // Map cart items with variant details
        const details = cartItems.map(cartItem => {
          const variant = variants.find(v => v.id === cartItem.productVariantId)
          return {
            ...cartItem,
            productTitle: variant?.product?.title,
            shapeName: variant?.shape?.name,
            lengthName: variant?.length?.name,
            finishName: variant?.finish?.name,
            price: variant?.price_override || variant?.product?.base_price,
          }
        })

        setCartDetails(details)

        // Calculate subtotal
        const total = details.reduce((sum, item) => sum + ((item.price || 0) * item.quantity), 0)
        setSubtotal(total)
      } catch (error) {
        console.error('Failed to load cart details:', error)
        toast.error('Failed to load cart details')
      }
    }

    loadCartDetails()
  }, [cartItems, isHydrated])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleProvinceChange = (value: string) => {
    setFormData(prev => ({ ...prev, province: value }))
  }

  const shippingFee = 500
  const total = subtotal + shippingFee

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (cartItems.length === 0) {
      toast.error('Your cart is empty')
      return
    }

    setIsLoading(true)
    try {
      const result = await createCODOrder({
        ...formData,
        cartItems,
      })

      if (!result.success) {
        toast.error(result.error || 'Failed to create order')
        return
      }

      // Clear cart after successful order
      // TODO: integrate with GuestCartContext.clearCart()

      // Redirect to success page with order number
      router.push(`/checkout/success?order_number=${result.orderNumber}`)
    } catch (error) {
      console.error('Checkout error:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12">
        <div className="mx-auto max-w-2xl px-4">
          <Card>
            <CardContent className="py-8">
              <LoadingSpinner />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12">
      <div className="mx-auto max-w-2xl px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Checkout - Cash on Delivery</CardTitle>
            <p className="text-muted-foreground mt-2">
              Please pay when your order arrives
            </p>
          </CardHeader>
          <CardContent>
            {cartItems.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">Your cart is empty</p>
                <Button onClick={() => router.push('/')}>
                  Continue Shopping
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Customer Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Your Information</h3>
                  
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="customerName">Full Name *</Label>
                      <Input
                        id="customerName"
                        name="customerName"
                        value={formData.customerName}
                        onChange={handleInputChange}
                        placeholder="e.g. Amina Ahmed"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="customerPhone">Phone Number *</Label>
                      <Input
                        id="customerPhone"
                        name="customerPhone"
                        type="tel"
                        value={formData.customerPhone}
                        onChange={handleInputChange}
                        placeholder="e.g. 0300-1234567"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customerEmail">Email (Optional)</Label>
                    <Input
                      id="customerEmail"
                      name="customerEmail"
                      type="email"
                      value={formData.customerEmail}
                      onChange={handleInputChange}
                      placeholder="e.g. amina@example.com"
                    />
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="space-y-4 border-t pt-6">
                  <h3 className="text-lg font-semibold">Shipping Address</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="street">Street Address *</Label>
                    <Input
                      id="street"
                      name="street"
                      value={formData.street}
                      onChange={handleInputChange}
                      placeholder="e.g. 123 Mall Road"
                      required
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="e.g. Lahore"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Postal Code *</Label>
                      <Input
                        id="postalCode"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        placeholder="e.g. 54000"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="province">Province *</Label>
                    <Select value={formData.province} onValueChange={handleProvinceChange}>
                      <SelectTrigger id="province">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PAKISTANI_PROVINCES.map(province => (
                          <SelectItem key={province} value={province}>
                            {province}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="space-y-4 border-t pt-6">
                  <h3 className="text-lg font-semibold">Order Summary</h3>
                  
                  {/* Cart Items */}
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {cartDetails.map(item => (
                      <div key={item.productVariantId} className="flex justify-between text-sm py-2 border-b">
                        <div>
                          <p className="font-medium">{item.productTitle}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.shapeName} • {item.lengthName} • {item.finishName}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">Rs. {((item.price || 0) * item.quantity).toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">×{item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="space-y-2 text-sm border-t pt-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal:</span>
                      <span>Rs. {subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping:</span>
                      <span>Rs. {shippingFee.toLocaleString()}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-semibold text-base">
                      <span>Total:</span>
                      <span>Rs. {total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || cartItems.length === 0}
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner />
                      <span className="ml-2">Processing...</span>
                    </>
                  ) : (
                    `Place Order (COD) - Rs. ${total.toLocaleString()}`
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Your order will be confirmed via email. Payment is due upon delivery.
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

