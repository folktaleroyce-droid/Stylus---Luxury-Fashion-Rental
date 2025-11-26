import React, { createContext, useContext, useState } from 'react';
import { Product, Category } from '../types';
import { MOCK_PRODUCTS } from '../constants';

interface ProductContextType {
  products: Product[];
  addProduct: (product: Product) => void;
}

const ProductContext = createContext<ProductContextType>({
  products: [],
  addProduct: () => {},
});

export const useProduct = () => useContext(ProductContext);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);

  const addProduct = (newProduct: Product) => {
    // Add new product to the beginning of the list
    setProducts((prev) => [newProduct, ...prev]);
  };

  return (
    <ProductContext.Provider value={{ products, addProduct }}>
      {children}
    </ProductContext.Provider>
  );
};
