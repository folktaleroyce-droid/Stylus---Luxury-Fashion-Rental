import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Category, Product, ProductFilter, SortOption } from '../types';
import { Filter, Search, X, Eye, ArrowUpDown, Heart } from 'lucide-react';
import { useProduct } from '../context/ProductContext';
import { useWishlist } from '../context/WishlistContext';
import { Button } from '../components/Button';

export const Catalog: React.FC = () => {
  const { products } = useProduct();
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  
  // Consolidated Filter State using the Interface
  const [filters, setFilters] = useState<ProductFilter>({
    category: 'All',
    searchQuery: '',
    color: 'All',
    size: 'All',
    occasion: 'All',
    maxPrice: 1000,
    sortBy: 'newest'
  });

  // Extract unique values for dynamic filter options
  const colors = ['All', ...Array.from(new Set(products.map(p => p.color).filter(Boolean)))];
  const occasions = ['All', ...Array.from(new Set(products.map(p => p.occasion).filter(Boolean)))];
  // Flatten all available sizes arrays and get unique values
  const sizes = ['All', ...Array.from(new Set(products.flatMap(p => p.availableSizes).filter(Boolean))).sort()];

  // Filter Function
  const filteredProducts = products.filter(p => {
    const matchCategory = filters.category === 'All' || p.category === filters.category;
    const matchSearch = p.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) || 
                        p.brand.toLowerCase().includes(filters.searchQuery.toLowerCase());
    const matchColor = filters.color === 'All' || p.color === filters.color;
    const matchOccasion = filters.occasion === 'All' || p.occasion === filters.occasion;
    const matchSize = filters.size === 'All' || p.availableSizes.includes(filters.size);
    const matchPrice = p.rentalPrice <= filters.maxPrice;

    return matchCategory && matchSearch && matchColor && matchOccasion && matchSize && matchPrice;
  }).sort((a, b) => {
    if (filters.sortBy === 'price_asc') {
      return a.rentalPrice - b.rentalPrice;
    } else if (filters.sortBy === 'price_desc') {
      return b.rentalPrice - a.rentalPrice;
    }
    // Default to newest (index based/original order which is effectively newest first in this context)
    return 0;
  });

  const clearFilters = () => {
    setFilters({
      category: 'All',
      searchQuery: '',
      color: 'All',
      size: 'All',
      occasion: 'All',
      maxPrice: 1000,
      sortBy: 'newest'
    });
  };

  const updateFilter = (key: keyof ProductFilter, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-espresso pb-20">
      
      {/* Quick View Modal */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setQuickViewProduct(null)}>
            <div className="bg-[#1f0c05] border border-golden-orange w-full max-w-4xl rounded-sm relative shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col md:flex-row overflow-hidden" onClick={e => e.stopPropagation()}>
                <button 
                    onClick={() => setQuickViewProduct(null)} 
                    className="absolute top-4 right-4 text-cream/50 hover:text-golden-orange z-10 p-2 bg-black/20 rounded-full transition-colors"
                >
                    <X size={24} />
                </button>
                <div className="w-full md:w-1/2 h-64 md:h-auto bg-white/5 relative">
                    <img src={quickViewProduct.images[0]} alt={quickViewProduct.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-8 w-full md:w-1/2 flex flex-col justify-center bg-[#1f0c05]">
                    <span className="text-golden-orange text-xs uppercase tracking-widest mb-2 font-bold">{quickViewProduct.brand}</span>
                    <h2 className="font-serif text-3xl md:text-4xl text-cream mb-4">{quickViewProduct.name}</h2>
                    <p className="text-cream/70 mb-6 leading-relaxed line-clamp-4 font-light">{quickViewProduct.description}</p>
                    
                    <div className="flex items-center justify-between mb-8 border-t border-white/10 pt-6">
                        <div>
                             <p className="font-serif text-3xl text-cream animate-pulse">${quickViewProduct.rentalPrice}</p>
                             <p className="text-xs text-cream/40 uppercase tracking-wide">Rental / 4 Days</p>
                        </div>
                        <div>
                             <p className="font-serif text-xl text-cream/50 line-through">${quickViewProduct.retailPrice}</p>
                             <p className="text-xs text-cream/30 uppercase tracking-wide text-right">Retail</p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button fullWidth onClick={() => setQuickViewProduct(null)} variant="outline">Close</Button>
                        <Link to={`/product/${quickViewProduct.id}`} className="w-full">
                            <Button fullWidth>Rent Now</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-[#1a0a04] py-12 px-4 mb-8 border-b border-white/5">
        <div className="max-w-7xl mx-auto">
          <h1 className="font-serif text-4xl md:text-5xl text-cream mb-4">The Collection</h1>
          <p className="text-cream/50 max-w-2xl font-light mb-8">
            Discover our curated selection of high-fashion garments and accessories.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-xl">
            <input 
              type="text"
              value={filters.searchQuery}
              onChange={(e) => updateFilter('searchQuery', e.target.value)}
              placeholder="Search designers, styles, or keywords..."
              className="w-full bg-white/5 border border-white/10 text-cream pl-12 pr-4 py-3 rounded-sm focus:outline-none focus:border-golden-orange transition-colors"
            />
            <Search className="absolute left-4 top-3.5 text-cream/40" size={20} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Filter Panel */}
        <div className="bg-[#1f0c05] border border-white/5 p-6 mb-10 rounded-sm shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-end">
            
            {/* Category Filter */}
            <div className="w-full">
               <label className="text-xs text-golden-orange uppercase tracking-widest mb-2 block font-bold">Category</label>
               <select 
                value={filters.category}
                onChange={(e) => updateFilter('category', e.target.value as Category | 'All')}
                className="w-full bg-black/20 border border-white/10 text-cream px-3 py-2 text-sm focus:outline-none focus:border-golden-orange"
               >
                 <option value="All">All Categories</option>
                 {Object.values(Category).map(cat => <option key={cat} value={cat}>{cat}</option>)}
               </select>
            </div>

            {/* Size Filter */}
            <div className="w-full">
               <label className="text-xs text-golden-orange uppercase tracking-widest mb-2 block font-bold">Size</label>
               <select 
                value={filters.size}
                onChange={(e) => updateFilter('size', e.target.value)}
                className="w-full bg-black/20 border border-white/10 text-cream px-3 py-2 text-sm focus:outline-none focus:border-golden-orange"
               >
                 {sizes.map(s => <option key={s} value={s}>{s}</option>)}
               </select>
            </div>

            {/* Color Filter */}
            <div className="w-full">
               <label className="text-xs text-golden-orange uppercase tracking-widest mb-2 block font-bold">Color</label>
               <select 
                value={filters.color}
                onChange={(e) => updateFilter('color', e.target.value)}
                className="w-full bg-black/20 border border-white/10 text-cream px-3 py-2 text-sm focus:outline-none focus:border-golden-orange"
               >
                 {colors.map(c => <option key={c} value={c}>{c}</option>)}
               </select>
            </div>

            {/* Occasion Filter */}
            <div className="w-full">
               <label className="text-xs text-golden-orange uppercase tracking-widest mb-2 block font-bold">Occasion</label>
               <select 
                value={filters.occasion}
                onChange={(e) => updateFilter('occasion', e.target.value)}
                className="w-full bg-black/20 border border-white/10 text-cream px-3 py-2 text-sm focus:outline-none focus:border-golden-orange"
               >
                 {occasions.map(o => <option key={o} value={o}>{o}</option>)}
               </select>
            </div>

             {/* Price Filter */}
            <div className="w-full relative">
               <label className="text-xs text-golden-orange uppercase tracking-widest mb-2 block font-bold">
                 Max Price: ${filters.maxPrice}
               </label>
               <input 
                type="range" 
                min="50" 
                max="1000" 
                step="10"
                value={filters.maxPrice}
                onChange={(e) => updateFilter('maxPrice', Number(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-golden-orange"
               />
               
               {/* Clear Button Positioned absolutely for desktop, or separate in grid */}
               <button 
                onClick={clearFilters}
                className="absolute -bottom-6 right-0 flex items-center text-xs text-cream/50 hover:text-white uppercase tracking-widest transition-colors"
               >
                 <X size={12} className="mr-1" /> Reset
               </button>
            </div>
            
          </div>
        </div>

        {/* Results Count & Sort */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-center text-cream/60 text-sm gap-4">
          <span>Showing {filteredProducts.length} results</span>
          
          <div className="flex items-center space-x-3">
             <div className="flex items-center text-golden-orange space-x-2 bg-[#1f0c05] px-3 py-1 border border-white/10">
                <ArrowUpDown size={14} />
                <span className="uppercase tracking-widest text-xs font-bold">Sort</span>
             </div>
             <select
                value={filters.sortBy}
                onChange={(e) => updateFilter('sortBy', e.target.value as SortOption)}
                className="bg-[#1f0c05] border border-white/10 text-cream px-3 py-1.5 text-sm focus:outline-none focus:border-golden-orange rounded-sm min-w-[180px]"
            >
                <option value="newest">Newest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {filteredProducts.map((product) => (
            <ProductCard 
                key={product.id} 
                product={product} 
                onQuickView={setQuickViewProduct} 
            />
          ))}
          {filteredProducts.length === 0 && (
            <div className="col-span-full text-center py-20 text-cream/50">
              <p className="font-serif text-xl">No items match your criteria.</p>
              <button onClick={clearFilters} className="text-golden-orange mt-2 underline">Reset Filters</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ProductCard: React.FC<{ product: Product; onQuickView: (p: Product) => void }> = ({ product, onQuickView }) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isWishlisted = isInWishlist(product.id);

  return (
    <div className="group relative flex flex-col h-full">
      <div className="relative h-[450px] w-full overflow-hidden bg-cream/5 mb-4">
        <img 
          src={product.images[0]} 
          alt={product.name} 
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        {product.images[1] && (
           <img 
            src={product.images[1]} 
            alt={product.name} 
            className="absolute inset-0 h-full w-full object-cover object-center opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-in-out"
          />
        )}
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors duration-500"></div>
        
        {/* Wishlist Toggle Button - Always visible or visible on hover based on preference, here keeping somewhat subtle */}
        <button 
            onClick={(e) => { e.preventDefault(); toggleWishlist(product); }}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/20 hover:bg-black/40 text-cream transition-all duration-300 transform hover:scale-110"
        >
            <Heart size={20} className={isWishlisted ? "fill-golden-orange text-golden-orange" : "text-cream"} />
        </button>

        {/* Strong CTA Button + Quick View on Card */}
        <div className="absolute bottom-6 left-6 right-6 translate-y-4 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 flex flex-col gap-3">
          <Link to={`/product/${product.id}`}>
            <Button fullWidth variant="primary" className="shadow-lg">Rent Now</Button>
          </Link>
          <button 
            onClick={(e) => { e.preventDefault(); onQuickView(product); }}
            className="w-full bg-espresso/90 backdrop-blur-md text-cream border border-golden-orange/30 py-3 uppercase tracking-widest text-xs font-bold hover:bg-golden-orange hover:text-espresso transition-all duration-300 flex items-center justify-center gap-2"
          >
             <Eye size={14} /> Quick View
          </button>
        </div>
      </div>
      
      <div className="flex justify-between items-start flex-grow">
        <div>
          <p className="text-golden-orange text-xs uppercase tracking-widest mb-1">{product.brand}</p>
          <h3 className="font-serif text-xl text-cream mb-1 group-hover:text-golden-light transition-colors">{product.name}</h3>
        </div>
      </div>
      <div className="flex items-baseline space-x-2 mt-2 pt-2 border-t border-white/5">
        <span className="text-cream font-medium">${product.rentalPrice} <span className="text-xs text-cream/50 font-light">/ 4 days</span></span>
        {product.availableSizes.length > 0 && (
           <span className="text-[10px] text-cream/40 uppercase ml-auto">Sizes: {product.availableSizes.slice(0, 3).join(', ')}{product.availableSizes.length > 3 ? '+' : ''}</span>
        )}
      </div>
    </div>
  );
};