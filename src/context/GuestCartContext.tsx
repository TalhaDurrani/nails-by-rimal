'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

export interface GuestCartItem {
  productVariantId: number
  quantity: number
}

interface GuestCartContextType {
  cartItems: GuestCartItem[]
  addToCart: (productVariantId: number, quantity: number) => void
  removeFromCart: (productVariantId: number) => void
  updateQuantity: (productVariantId: number, quantity: number) => void
  clearCart: () => void
  isHydrated: boolean
}

const GuestCartContext = createContext<GuestCartContextType | undefined>(undefined)

const CART_STORAGE_KEY = 'nails-by-rimal-cart'

export function GuestCartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<GuestCartItem[]>([])
  const [isHydrated, setIsHydrated] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          setCartItems(parsed)
        }
      }
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error)
    }
    setIsHydrated(true)
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems))
    }
  }, [cartItems, isHydrated])

  const addToCart = (productVariantId: number, quantity: number) => {
    setCartItems(prevItems => {
      const existing = prevItems.find(item => item.productVariantId === productVariantId)
      
      if (existing) {
        // Update quantity if variant already in cart
        return prevItems.map(item =>
          item.productVariantId === productVariantId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      } else {
        // Add new item
        return [...prevItems, { productVariantId, quantity }]
      }
    })
  }

  const removeFromCart = (productVariantId: number) => {
    setCartItems(prevItems =>
      prevItems.filter(item => item.productVariantId !== productVariantId)
    )
  }

  const updateQuantity = (productVariantId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productVariantId)
    } else {
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.productVariantId === productVariantId
            ? { ...item, quantity }
            : item
        )
      )
    }
  }

  const clearCart = () => {
    setCartItems([])
  }

  return (
    <GuestCartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isHydrated,
      }}
    >
      {children}
    </GuestCartContext.Provider>
  )
}

export function useGuestCart() {
  const context = useContext(GuestCartContext)
  if (!context) {
    throw new Error('useGuestCart must be used within GuestCartProvider')
  }
  return context
}
