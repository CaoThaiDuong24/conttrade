'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { useAuth } from '@/components/providers/auth-context';

// Types
interface CartItem {
  id: string;
  cart_id: string;
  listing_id: string;
  quantity: number;
  deal_type: 'SALE' | 'RENTAL';
  rental_duration_months: number;
  price_snapshot: string;
  currency: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  listing: {
    id: string;
    title: string;
    type: string;
    status: string;
    price_sale?: string;
    price_rental_per_month?: string;
    currency: string;
    seller_user_id: string;
    users?: {
      id: string;
      display_name?: string;
      email?: string;
      avatar_url?: string;
    };
    seller?: {
      id: string;
      display_name?: string;
      email?: string;
    };
    depots?: {
      id: string;
      name: string;
      code?: string;
      province?: string;
      city?: string;
    };
    location?: {
      city?: string;
      country?: string;
    };
  };
}

interface Cart {
  id: string;
  user_id: string;
  status: 'ACTIVE' | 'ABANDONED' | 'CONVERTED';
  expires_at: string;
  created_at: string;
  updated_at: string;
  cart_items: CartItem[];
}

interface AddToCartOptions {
  deal_type?: 'SALE' | 'RENTAL';
  rental_duration_months?: number;
  notes?: string;
  selected_container_ids?: string[]; // ✅ NEW: Support container selection
}

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  selectedItemIds: string[];
  refreshCart: () => Promise<void>;
  addToCart: (listingId: string, quantity: number, options?: AddToCartOptions) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotalItems: () => number;
  getTotalAmount: (currency?: string) => number;
  toggleItemSelection: (itemId: string) => void;
  selectAllItems: () => void;
  clearSelection: () => void;
  isItemSelected: (itemId: string) => boolean;
  getSelectedItemsCount: () => number;
  getSelectedTotalAmount: (currency?: string) => number;
  checkout: (type: 'rfq' | 'order', deliveryAddressId?: string) => Promise<{ ids: string[] }>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const isCleaningSelection = useRef(false);
  
  const { user, token: authToken } = useAuth();
  const isAuthenticated = !!user;

  // Refresh cart data
  const refreshCart = useCallback(async () => {
    if (!authToken) {
      setCart(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006';
      const apiUrl = `${API_URL}/api/v1/cart`;
      
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setCart(data.data);
        }
      } else if (response.status === 404) {
        setCart(null);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [authToken]);

  // Add item to cart
  const addToCart = useCallback(async (
    listingId: string,
    quantity: number,
    options?: AddToCartOptions
  ) => {
    if (!authToken) {
      throw new Error('Unauthorized');
    }

    try {
      setError(null);
      
      const requestBody = {
        listing_id: listingId,
        quantity,
        ...options
      };
      
      // ✅ DEBUG: Log request body
      console.log('🛒 Add to Cart - Request Body:', JSON.stringify(requestBody, null, 2));
      
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006';
      const apiUrl = `${API_URL}/api/v1/cart/items`;
      
      console.log('🛒 Add to Cart - API URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      
      // ✅ DEBUG: Log response
      console.log('🛒 Add to Cart - Response:', {
        status: response.status,
        ok: response.ok,
        data
      });
      
      if (response.ok && data.success) {
        await refreshCart();
      } else {
        throw new Error(data.error || data.message || 'Failed to add to cart');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to add to cart';
      console.error('🛒 Add to Cart - Error:', errorMessage, err);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [authToken, refreshCart]);

  // Update quantity
  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    if (!authToken) {
      throw new Error('Unauthorized');
    }

    try {
      setError(null);
      
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006';
      const apiUrl = `${API_URL}/api/v1/cart/items/${itemId}`;
      
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity }),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        await refreshCart();
      } else {
        throw new Error(data.message || 'Failed to update quantity');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update quantity';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [authToken, refreshCart]);

  // Remove item from cart
  const removeFromCart = useCallback(async (itemId: string) => {
    if (!authToken) {
      throw new Error('Unauthorized');
    }

    try {
      setError(null);
      
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006';
      const apiUrl = `${API_URL}/api/v1/cart/items/${itemId}`;
      
      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        await refreshCart();
      } else {
        throw new Error(data.message || 'Failed to remove item');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to remove item';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [authToken, refreshCart]);

  // Clear cart
  const clearCart = useCallback(async () => {
    if (!authToken) {
      throw new Error('Unauthorized');
    }

    try {
      setError(null);
      
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006';
      const apiUrl = `${API_URL}/api/v1/cart`;
      
      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setCart(null);
      } else {
        throw new Error(data.message || 'Failed to clear cart');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to clear cart';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [authToken]);

  // Get total items (count of products, not total quantity)
  const getTotalItems = useCallback(() => {
    if (!cart) return 0;
    return cart.cart_items.length;
  }, [cart]);

  // Get total amount by currency
  const getTotalAmount = useCallback((currency?: string) => {
    if (!cart) return 0;
    
    const items = currency 
      ? cart.cart_items.filter(item => item.currency === currency)
      : cart.cart_items;

    return items.reduce((sum, item) => {
      const price = parseFloat(item.price_snapshot);
      const months = item.deal_type === 'RENTAL' ? 
        item.rental_duration_months : 1;
      return sum + (price * item.quantity * months);
    }, 0);
  }, [cart]);

  // Checkout
  const checkout = useCallback(async (
    type: 'rfq' | 'order',
    deliveryAddressId?: string
  ) => {
    if (!authToken) {
      throw new Error('Unauthorized');
    }

    // If no items are selected, use all items
    const itemsToCheckout = selectedItemIds.length > 0 ? selectedItemIds : cart?.cart_items.map(item => item.id) || [];

    if (itemsToCheckout.length === 0) {
      throw new Error('Không có sản phẩm nào được chọn');
    }

    try {
      setError(null);
      
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006';
      const apiUrl = `${API_URL}/api/v1/cart/checkout`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          checkout_type: type,
          delivery_address_id: deliveryAddressId,
          cart_item_ids: itemsToCheckout
        }),
      });

      const data = await response.json();

      if (response.ok && data.success && data.data) {
        await refreshCart();
        setSelectedItemIds([]); // Clear selection after checkout
        return data.data;
      } else {
        throw new Error(data.message || 'Checkout failed');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Checkout failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [authToken, refreshCart, selectedItemIds, cart]);

  // Item selection functions
  const toggleItemSelection = useCallback((itemId: string) => {
    setSelectedItemIds(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  }, []);

  const selectAllItems = useCallback(() => {
    if (cart) {
      setSelectedItemIds(cart.cart_items.map(item => item.id));
    }
  }, [cart]);

  const clearSelection = useCallback(() => {
    setSelectedItemIds([]);
  }, []);

  const isItemSelected = useCallback((itemId: string) => {
    return selectedItemIds.includes(itemId);
  }, [selectedItemIds]);

  const getSelectedItemsCount = useCallback(() => {
    if (!cart) return 0;
    
    // Only count selected items that still exist in cart
    const validSelectedIds = selectedItemIds.filter(id => 
      cart.cart_items.some(item => item.id === id)
    );
    
    return validSelectedIds.length;
  }, [selectedItemIds, cart]);

  const getSelectedTotalAmount = useCallback((currency?: string) => {
    if (!cart) return 0;
    
    const selectedItems = cart.cart_items.filter(item => selectedItemIds.includes(item.id));
    const items = currency 
      ? selectedItems.filter(item => item.currency === currency)
      : selectedItems;

    return items.reduce((sum, item) => {
      const price = parseFloat(item.price_snapshot);
      const months = item.deal_type === 'RENTAL' ? 
        item.rental_duration_months : 1;
      return sum + (price * item.quantity * months);
    }, 0);
  }, [cart, selectedItemIds]);

  // Auto-refresh cart when user logs in
  useEffect(() => {
    if (isAuthenticated) {
      refreshCart();
    } else {
      setCart(null);
      setSelectedItemIds([]);
    }
  }, [isAuthenticated, refreshCart]);

  // Clean up selectedItemIds when cart changes
  useEffect(() => {
    if (isCleaningSelection.current) return;
    
    if (cart && cart.cart_items.length > 0) {
      // Clean up selectedItemIds that no longer exist in cart
      const validItemIds = cart.cart_items.map(item => item.id);
      const cleanedSelection = selectedItemIds.filter(id => validItemIds.includes(id));
      
      if (cleanedSelection.length !== selectedItemIds.length) {
        isCleaningSelection.current = true;
        setSelectedItemIds(cleanedSelection);
        setTimeout(() => {
          isCleaningSelection.current = false;
        }, 0);
      }
    } else if (!cart || cart.cart_items.length === 0) {
      // Cart is empty, clear selection
      if (selectedItemIds.length > 0) {
        isCleaningSelection.current = true;
        setSelectedItemIds([]);
        setTimeout(() => {
          isCleaningSelection.current = false;
        }, 0);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart]);

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        error,
        selectedItemIds,
        refreshCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getTotalItems,
        getTotalAmount,
        toggleItemSelection,
        selectAllItems,
        clearSelection,
        isItemSelected,
        getSelectedItemsCount,
        getSelectedTotalAmount,
        checkout
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
