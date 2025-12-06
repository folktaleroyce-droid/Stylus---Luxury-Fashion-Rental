
import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem } from './CartContext';
import { OrderStatus } from '../types';

// Extended Item interface for Orders to track status per item
export interface OrderItem extends CartItem {
  status: OrderStatus;
}

export interface Order {
  id: string;
  userId: string; // Track who placed the order
  userName: string;
  date: string;
  items: OrderItem[];
  total: number;
  // Order level status (derived or general)
  status: OrderStatus; 
}

interface OrderContextType {
  orders: Order[];
  addOrder: (items: CartItem[], total: number, userId: string, userName: string) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void; // Legacy/Global
  updateOrderItemStatus: (orderId: string, itemId: string, status: OrderStatus) => void; // New granular control
}

const OrderContext = createContext<OrderContextType>({
  orders: [],
  addOrder: () => {},
  updateOrderStatus: () => {},
  updateOrderItemStatus: () => {},
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

  const addOrder = (items: CartItem[], total: number, userId: string, userName: string) => {
    // Map cart items to order items with initial status
    const orderItems: OrderItem[] = items.map(item => ({
        ...item,
        status: 'Pending Approval'
    }));

    const newOrder: Order = {
      id: `ORD-${Date.now().toString().slice(-6)}`,
      userId,
      userName,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      items: orderItems,
      total,
      status: 'Processing' 
    };
    setOrders(prev => [newOrder, ...prev]);
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  const updateOrderItemStatus = (orderId: string, itemId: string, status: OrderStatus) => {
      setOrders(prev => prev.map(order => {
          if (order.id !== orderId) return order;

          // Update the specific item
          const updatedItems = order.items.map(item => 
              item.id === itemId ? { ...item, status } : item
          );

          // Optional: Check if all items are handled to update main order status
          const allComplete = updatedItems.every(i => ['Accepted', 'Shipped', 'Completed', 'Returned', 'Cancelled', 'Rejected'].includes(i.status));
          
          return {
              ...order,
              items: updatedItems,
              status: allComplete ? 'Completed' : order.status
          };
      }));
  };

  return (
    <OrderContext.Provider value={{ orders, addOrder, updateOrderStatus, updateOrderItemStatus }}>
      {children}
    </OrderContext.Provider>
  );
};
