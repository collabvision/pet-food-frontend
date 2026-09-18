import { create } from 'zustand';
import { api } from '../lib/api';

export const useStore = create((set, get) => ({
  // --- Auth State ---
  user: null,
  isAuthLoading: true,
  
  setUser: (user) => set({ user }),
  setAuthLoading: (isAuthLoading) => set({ isAuthLoading }),

  fetchUser: async () => {
    try {
      set({ isAuthLoading: true });
      const res = await api.get('/auth/me');
      if (res && res.success) {
        set({ user: res.data });
      } else {
        set({ user: null });
      }
    } catch (error) {
      set({ user: null });
    } finally {
      set({ isAuthLoading: false });
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error', error);
    }
    set({ user: null });
  },

  // --- Cart State ---
  cart: {
    items: [],
    totalAmount: 0,
    totalItems: 0,
  },
  isCartLoading: false,

  fetchCart: async () => {
    try {
      set({ isCartLoading: true });
      const res = await api.get('/cart');
      if (res && res.success) {
        set({ cart: res.data });
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      set({ isCartLoading: false });
    }
  },

  addToCart: async (productId, quantity = 1) => {
    try {
      set({ isCartLoading: true });
      const res = await api.post('/cart/items', { productId, quantity });
      if (res && res.success) {
        // Optimistically update or re-fetch cart
        await get().fetchCart();
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    } finally {
      set({ isCartLoading: false });
    }
  },

  updateCartItem: async (productId, quantity) => {
    try {
      set({ isCartLoading: true });
      const res = await api.patch(`/cart/items/${productId}`, { quantity });
      if (res && res.success) {
        await get().fetchCart();
      }
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    } finally {
      set({ isCartLoading: false });
    }
  },

  removeFromCart: async (productId) => {
    try {
      set({ isCartLoading: true });
      await api.delete(`/cart/items/${productId}`);
      await get().fetchCart();
    } catch (error) {
      console.error('Error removing cart item:', error);
      throw error;
    } finally {
      set({ isCartLoading: false });
    }
  },
  
  clearCart: async () => {
    try {
      set({ isCartLoading: true });
      await api.delete('/cart');
      await get().fetchCart();
    } catch (error) {
      console.error('Error clearing cart:', error);
    } finally {
      set({ isCartLoading: false });
    }
  }
}));
