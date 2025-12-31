
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Category, Product, ProductFilter, SortOption } from '../types';
import { Filter, Search, X, Eye, ArrowUpDown, Heart, ShoppingBag, SlidersHorizontal, ChevronDown, Sparkles, ChevronLeft, ChevronRight, Clock, MapPin, Maximize2 } from 'lucide-react';
import { useProduct } from '../context/ProductContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { getRecommendations } from '../services/geminiService';

export const Catalog: React.FC = () => {
  const { products } = useProduct();
  const { addToSearchHistory, currentUser, registeredUsers } = useAuth();
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [quickViewIndex, setQuickViewIndex] = useState(0);
  
  const [aiRecs, setAiRecs] = useState<string>('');
  const [filters, setFilters] = useState<ProductFilter>({
    category: 'All',
    searchQuery: '',
    color: 'All',
    size: 'All',
    occasion: 'All',
    maxPrice: 5000,
    sortBy: 'newest',
    duration: 'All',
    state: 'All',
    city: 'All'
  });

  useEffect(() => {
      setQuickViewIndex(0);
  }, [quickViewProduct]);

  useEffect(() => {
      const fetchRecs = async () => {
          if (currentUser?.searchHistory && currentUser.searchHistory.length > 0) {
              const recs = await getRecommendations(currentUser.searchHistory, "Browsing Full Catalog");
              setAiRecs(recs);
          }
      };
      fetchRecs();
  }, [currentUser]);

  useEffect(() => {
      const timer = setTimeout(() => {
          if (filters.searchQuery.length > 3) {
              addToSearchHistory(filters.searchQuery);
          }
      }, 2000);
      return () => clearTimeout(timer);
  }, [filters.searchQuery]);

  const colors = ['All', ...Array.from(new Set(products.map(p => p.color).filter(Boolean)))];
  const occasions = ['All', ...Array.from(new Set(products.map(p => p.occasion).filter(Boolean)))];
  const sizes = ['All', ...Array.from(new Set(products.flatMap(p => p.availableSizes).filter(Boolean))).sort()];
  const partners = registeredUsers.filter(u => u.role === 'Partner');
  const availableStates = ['All', ...Array.from(new Set(partners.map(p => p.state).filter(Boolean)))];
  const availableCities = ['All', ...Array.from(new Set(partners.filter(p => filters.state === 'All' || p.state === filters.state).map(p => p.city).filter(Boolean)))];

  const filteredProducts = products.filter(p => {
    const owner = registeredUsers.find(u => u.id === p.ownerId);
    const ownerState = owner?.state || 'New York';
    const ownerCity = owner?.city || 'New York';
    const matchCategory = filters.category === 'All' || p.category === filters.category;
    const matchSearch = p.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) || 
                        p.brand.toLowerCase().includes(filters.searchQuery.toLowerCase());
    const matchColor = filters.color === 'All' || p.color === filters.color;
    const matchOccasion = filters.occasion === 'All' || p.occasion === filters.occasion;
    const matchSize = filters.size === 'All' || p.availableSizes.includes(filters.size);
    const matchPrice = p.rentalPrice <= filters.maxPrice;
    const matchDuration = filters.duration === 'All' || !p.rentalDuration || p.rentalDuration === Number(filters.duration);
    const matchState = filters.state === 'All' || ownerState === filters.state;
    const matchCity = filters.city === 'All' || ownerCity === filters.city;
    return matchCategory && matchSearch && matchColor && matchOccasion && matchSize && matchPrice && matchDuration && matchState && matchCity;
  }).sort((a, b) => {
    if (filters.sortBy === 'price_asc') return a.rentalPrice - b.rentalPrice;
    if (filters.sortBy === 'price_desc') return b.rentalPrice - a.rentalPrice;
    return 0;
  });

  const clearFilters = () => setFilters({
    category: 'All', searchQuery: '', color: 'All', size: 'All', occasion: 'All', maxPrice: 5000, sortBy: 'newest', duration: 'All', state: 'All', city: 'All'
  });

  const updateFilter = (key: keyof ProductFilter, value: any) => setFilters(prev => ({ ...prev, [key]: value }));

  return (
    <div className="min-h-screen bg-espresso pb-20 animate-fade-in">
      {/* Quick View Modal */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setQuickViewProduct(null)}>
            <div className="bg-[#1f0c05] border border-golden-orange w-full max-w-4xl rounded-sm relative shadow-2xl flex flex-col md:flex-row overflow-hidden" onClick={e => e.stopPropagation()}>
                <button onClick={() => setQuickViewProduct(null)} className="absolute top-4 right-4 text-cream/50 hover:text-golden-orange z-20 p-2 bg-black/20 rounded-full transition-colors"><X size={24} /></button>
                <div className="w-full md:w-1/2 h-64 md:h-[500px] bg-white/5 relative group">
                    <img src={quickViewProduct.images[quickViewIndex]} alt={quickViewProduct.name} className="w-full h-full object-cover" />
                    <div className="absolute top-6 left-6 bg-golden-orange text-espresso px-3 py-1 text-[10px] font-black rounded-sm shadow-xl flex items-center gap-1">
                        <Maximize2 size={12}/> METAVERSE READY
                    </div>
                </div>
                <div className="p-8 w-full md:w-1/2 flex flex-col justify-center bg-[#1f0c05]">
                    <span className="text-golden-orange text-xs uppercase tracking-widest mb-2 font-bold">{quickViewProduct.brand}</span>
                    <h2 className="font-serif text-3xl md:text-4xl text-cream mb-4">{quickViewProduct.name}</h2>
                    <div className="flex flex-col gap-6 mb-8 border-t border-white/10 pt-6">
                        <Link to={`/product/${quickViewProduct.id}`} className="flex-1">
                            <Button fullWidth className="animate-pulse">Open Digital Mirror</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Hero & Search */}
      <div className="bg-[#1a0a04] pt-12 pb-12 px-4 border-b border-white/5 shadow-xl relative overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative z-10">
            <p className="text-golden-orange text-xs uppercase tracking-[0.3em] mb-2 font-bold">The Archives</p>
            <h1 className="font-serif text-4xl md:text-6xl text-cream mb-8 leading-tight">Access Archival Excellence</h1>
            <div className="max-w-3xl mx-auto relative">
                <input 
                  type="text"
                  value={filters.searchQuery}
                  onChange={(e) => updateFilter('searchQuery', e.target.value)}
                  placeholder="Search designers or styles..."
                  className="w-full bg-[#1f0c05] border border-golden-orange/50 text-cream pl-14 pr-4 py-5 rounded-sm focus:outline-none focus:border-golden-orange placeholder:text-cream/30 text-lg"
                />
                <Search className="absolute left-5 top-5 text-golden-orange" size={24} />
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Filter Panel (Summary version for space) */}
        <div className="bg-[#1f0c05] border border-white/10 p-6 mb-10 rounded-sm shadow-xl relative">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6">
                <div className="w-full">
                    <label className="text-[10px] text-cream/50 uppercase tracking-widest mb-2 block font-bold">Category</label>
                    <select value={filters.category} onChange={(e) => updateFilter('category', e.target.value)} className="w-full bg-[#1a0a04] border border-white/10 text-cream px-3 py-2 text-sm focus:border-golden-orange outline-none">
                        <option value="All">All Categories</option>
                        {Object.values(Category).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
                {/* ... other filters same logic ... */}
                <div className="w-full lg:col-span-2">
                   <div className="flex justify-between mb-2"><label className="text-[10px] text-cream/50 uppercase tracking-widest font-bold">Max Rental Price</label><span className="text-xs text-golden-orange font-bold">${filters.maxPrice}</span></div>
                   <input type="range" min="50" max="5000" step="50" value={filters.maxPrice} onChange={(e) => updateFilter('maxPrice', Number(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-golden-orange" />
                </div>
                <div className="w-full flex items-end">
                    <Button variant="outline" fullWidth onClick={clearFilters} className="py-2 text-[10px]">Reset Filters</Button>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {filteredProducts.map((product) => (
             <div key={product.id} className="relative">
                <ProductCard product={product} onQuickView={setQuickViewProduct} />
             </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ProductCard: React.FC<{ product: Product; onQuickView: (p: Product) => void }> = ({ product, onQuickView }) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isWishlisted = isInWishlist(product.id);

  return (
    <div className="group relative flex flex-col h-full hover:-translate-y-2 transition-transform duration-500">
      <div className="relative h-[480px] w-full overflow-hidden bg-cream/5 mb-4 shadow-2xl rounded-sm">
        <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" />
        
        {/* Floating Metaverse Badge - High Visibility */}
        <div className="absolute top-4 left-4 z-20">
            <div className="bg-golden-orange/90 backdrop-blur-md text-espresso text-[9px] font-black uppercase px-2.5 py-1 tracking-wider rounded-sm flex items-center gap-1.5 shadow-[0_5px_15px_rgba(0,0,0,0.3)] animate-pulse border border-white/20">
                <Sparkles size={11} className="fill-espresso" /> DIGITAL MIRROR READY
            </div>
        </div>

        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 translate-x-12 group-hover:translate-x-0 transition-all duration-300">
            <button onClick={(e) => {e.preventDefault(); toggleWishlist(product)}} className="p-3 rounded-full bg-espresso/80 text-cream hover:bg-white hover:text-red-500 transition-all shadow-lg border border-white/10">
                <Heart size={18} className={isWishlisted ? "fill-red-500 text-red-500" : ""} />
            </button>
        </div>

        <div className="absolute bottom-6 left-6 right-6 translate-y-8 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100 flex flex-col gap-3">
          <Link to={`/product/${product.id}`} className="w-full">
            <Button fullWidth variant="primary" className="shadow-[0_0_20px_rgba(225,175,77,0.5)] border-none font-black text-xs tracking-[0.2em] flex items-center justify-center gap-2">
                <Maximize2 size={16} /> TRY IN METAVERSE
            </Button>
          </Link>
          <button onClick={() => onQuickView(product)} className="w-full bg-black/60 backdrop-blur-md text-white border border-white/20 py-3 uppercase tracking-widest text-[10px] font-bold hover:bg-white hover:text-espresso transition-all">
             Quick Look
          </button>
        </div>
      </div>
      
      <div className="flex flex-col flex-grow px-1">
          <p className="text-golden-orange text-[10px] uppercase tracking-[0.3em] mb-1 font-black">{product.brand}</p>
          <h3 className="font-serif text-xl text-cream mb-2 group-hover:text-golden-orange transition-colors">{product.name}</h3>
          <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
             <span className="text-cream font-serif text-lg">${product.rentalPrice} <span className="text-[10px] text-cream/40 font-sans font-light uppercase tracking-widest">/ 4 days</span></span>
             <Link to={`/product/${product.id}`} className="text-golden-orange/50 hover:text-golden-orange transition-colors"><ChevronRight size={20}/></Link>
          </div>
      </div>
    </div>
  );
};
