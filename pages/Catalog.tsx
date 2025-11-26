import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MOCK_PRODUCTS } from '../constants';
import { Category, Product } from '../types';
import { Filter, ArrowRight } from 'lucide-react';

export const Catalog: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');

  const filteredProducts = selectedCategory === 'All' 
    ? MOCK_PRODUCTS 
    : MOCK_PRODUCTS.filter(p => p.category === selectedCategory);

  return (
    <div className="min-h-screen bg-espresso pb-20">
      {/* Header */}
      <div className="bg-[#1a0a04] py-16 px-4 mb-12 border-b border-white/5">
        <div className="max-w-7xl mx-auto">
          <h1 className="font-serif text-4xl md:text-5xl text-cream mb-4">The Collection</h1>
          <p className="text-cream/50 max-w-2xl font-light">
            Discover our curated selection of high-fashion garments and accessories, available for your next defining moment.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Filter */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10">
          <div className="flex overflow-x-auto pb-4 md:pb-0 space-x-2 w-full md:w-auto scrollbar-hide">
            <button 
              onClick={() => setSelectedCategory('All')}
              className={`px-6 py-2 rounded-full border text-sm uppercase tracking-wide transition-all ${selectedCategory === 'All' ? 'bg-golden-orange border-golden-orange text-espresso font-bold' : 'border-white/20 text-cream hover:border-golden-orange'}`}
            >
              All
            </button>
            {Object.values(Category).map((cat) => (
              <button 
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-2 rounded-full border text-sm uppercase tracking-wide whitespace-nowrap transition-all ${selectedCategory === cat ? 'bg-golden-orange border-golden-orange text-espresso font-bold' : 'border-white/20 text-cream hover:border-golden-orange'}`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="hidden md:flex items-center text-golden-orange text-sm font-medium">
            <Filter size={16} className="mr-2" />
            <span>{filteredProducts.length} Items Found</span>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  return (
    <div className="group relative">
      <div className="relative h-[400px] w-full overflow-hidden bg-cream/5 mb-4">
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0">
          <Link to={`/product/${product.id}`}>
            <button className="w-full bg-cream text-espresso py-3 uppercase tracking-widest text-xs font-bold hover:bg-golden-orange transition-colors">
              View Details
            </button>
          </Link>
        </div>
      </div>
      
      <div className="flex justify-between items-start">
        <div>
          <p className="text-golden-orange text-xs uppercase tracking-widest mb-1">{product.brand}</p>
          <h3 className="font-serif text-xl text-cream mb-1 group-hover:text-golden-light transition-colors">{product.name}</h3>
        </div>
      </div>
      <div className="flex items-baseline space-x-2 mt-2">
        <span className="text-cream font-medium">${product.rentalPrice} <span className="text-xs text-cream/50 font-light">/ 4 days</span></span>
        <span className="text-xs text-cream/30 line-through">RRP ${product.retailPrice}</span>
      </div>
    </div>
  );
};