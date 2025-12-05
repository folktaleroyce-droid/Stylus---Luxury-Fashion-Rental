
import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem } from './CartContext';
import { OrderStatus } from '../types';

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
}

interface OrderContextType {
  orders: Order[];
  addOrder: (items: CartItem[], total: number) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
}

const OrderContext = createContext<OrderContextType>({
  orders: [],
  addOrder: () => {},
  updateOrderStatus: () => {},
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
      status: 'Pending Approval' // Default for partner acceptance flow
    };
    setOrders(prev => [newOrder, ...prev]);
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  return (
    <OrderContext.Provider value={{ orders, addOrder, updateOrderStatus }}>
      {children}
    </OrderContext.Provider>
  );
};
