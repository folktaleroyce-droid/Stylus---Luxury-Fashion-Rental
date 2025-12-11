import React, { createContext, useContext, useState } from 'react';
import { Product, Category } from '../types';
import { MOCK_PRODUCTS } from '../constants';

interface ProductContextType {
  products: Product[];
  addProduct: (product: Product) => void;
  removeProduct: (productId: string) => void;
  incrementRentalCount: (productId: string) => void;
  toggleProductAvailability: (productId: string) => void;
}

const ProductContext = createContext<ProductContextType>({
  products: [],
  addProduct: () => {},
  removeProduct: () => {},
  incrementRentalCount: () => {},
  toggleProductAvailability: () => {},
});

export const useProduct = () => useContext(ProductContext);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS.map(p => ({...p, isAvailable: true}))); // Ensure default true

  const addProduct = (newProduct: Product) => {
    // Add new product to the beginning of the list
    const productWithDefaults = { ...newProduct, isAvailable: true };
    setProducts((prev) => [productWithDefaults, ...prev]);
  };

  const removeProduct = (productId: string) => {
    setProducts((prev) => prev.filter(p => p.id !== productId));
  };

  const toggleProductAvailability = (productId: string) => {
    setProducts((prev) => prev.map(p => 
      p.id === productId ? { ...p, isAvailable: !p.isAvailable } : p
    ));
  };

  const incrementRentalCount = (productId: string) => {
    setProducts((prev) => prev.map(product => {
      if (product.id === productId) {
        const newCount = (product.rentalCount || 0) + 1;
        let isForSale = product.isForSale;
        
        // Fixed rule: Max 5 rentals. Then it MUST be sell only.
        const RENTAL_THRESHOLD = 5;
        if (newCount >= RENTAL_THRESHOLD) {
            isForSale = true; // Force enable sale
        }
        
        // Legacy: if autoSellAfterRentals was set lower than 5
        if (product.autoSellAfterRentals && newCount >= product.autoSellAfterRentals) {
          isForSale = true;
        }

        return {
          ...product,
          rentalCount: newCount,
          isForSale
        };
      }
      return product;
    }));
  };

  return (
    <ProductContext.Provider value={{ products, addProduct, removeProduct, incrementRentalCount, toggleProductAvailability }}>
      {children}
    </ProductContext.Provider>
  );
};