import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem } from './CartContext';

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  status: 'Completed' | 'Returned' | 'Processing';
}

interface OrderContextType {
  orders: Order[];
  addOrder: (items: CartItem[], total: number) => void;
}

const OrderContext = createContext<OrderContextType>({
  orders: [],
  addOrder: () => {},
});

export const useOrders = () => useContext(OrderContext);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const storedOrders = localStorage.getItem('stylus_order_history');
    if (storedOrders) {
      try {
        setOrders(JSON.parse(storedOrders));
      } catch (e) {
        console.error("Failed to parse order history", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('stylus_order_history', JSON.stringify(orders));
  }, [orders]);

  const addOrder = (items: CartItem[], total: number) => {
    const newOrder: Order = {
      id: `ORD-${Date.now().toString().slice(-6)}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      items,
      total,
      status: 'Processing'
    };
    // Add new order to the top of the list
    setOrders(prev => [newOrder, ...prev]);
  };

  return (
    <OrderContext.Provider value={{ orders, addOrder }}>
      {children}
    </OrderContext.Provider>
  );
};