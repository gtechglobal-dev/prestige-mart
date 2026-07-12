import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { cartAPI } from '../api'
import { useAuth } from './AuthContext'

const CartContext = createContext()

export function CartProvider({ children }) {
  const { user } = useAuth()
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(false)
  const [itemCount, setItemCount] = useState(0)

  const fetchCart = useCallback(async () => {
    if (!user) { setCart(null); setItemCount(0); return }
    try {
      setLoading(true)
      const res = await cartAPI.get()
      setCart(res)
      setItemCount(res.items?.reduce((sum, i) => sum + i.quantity, 0) || 0)
    } catch (err) {
      console.error('Failed to fetch cart:', err)
    } finally { setLoading(false) }
  }, [user])

  useEffect(() => { fetchCart() }, [fetchCart])

  const addToCart = async (productId, variantId, quantity = 1) => {
    const res = await cartAPI.add({ productId, variantId, quantity })
    setCart(res.cart)
    setItemCount(res.cart.items?.reduce((sum, i) => sum + i.quantity, 0) || 0)
  }

  const updateItem = async (itemId, quantity) => {
    const res = await cartAPI.updateItem(itemId, { quantity })
    setCart(res)
    setItemCount(res.items?.reduce((sum, i) => sum + i.quantity, 0) || 0)
  }

  const removeItem = async (itemId) => {
    const res = await cartAPI.removeItem(itemId)
    setCart(res)
    setItemCount(res.items?.reduce((sum, i) => sum + i.quantity, 0) || 0)
  }

  const clearCart = async () => {
    await cartAPI.clear()
    setCart(null)
    setItemCount(0)
  }

  return (
    <CartContext.Provider value={{ cart, loading, itemCount, addToCart, updateItem, removeItem, clearCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
