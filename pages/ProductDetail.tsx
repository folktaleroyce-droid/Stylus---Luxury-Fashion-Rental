
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/Button';
// Added Diamond to the import list from lucide-react
import { Shield, Clock, Calendar as CalendarIcon, Check, ArrowLeft, Ruler, Star, Truck, AlertTriangle, X, Heart, ShoppingBag, Lock, DollarSign, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Info, ZoomIn, Maximize2, AlertCircle, Sparkles, Zap, Diamond } from 'lucide-react';
import { useProduct } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { getDeliveryEstimate } from '../services/geminiService';
import { VirtualTryOn } from '../components/VirtualTryOn';

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { products } = useProduct();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { currentUser, isAuthenticated } = useAuth();
  
  const product = products.find(p => p.id === id);
  
  const [selectedDuration, setSelectedDuration] = useState<4 | 8 | 12>(4);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [deliveryEstimate, setDeliveryEstimate] = useState<string>('Calculating...');
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [showMetaverse, setShowMetaverse] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [viewDate, setViewDate] = useState(new Date()); 
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [openPolicy, setOpenPolicy] = useState<string | null>('shipping');

  useEffect(() => {
      const fetchDelivery = async () => {
          if (currentUser?.location) {
              const estimate = await getDeliveryEstimate(currentUser.location, "London, UK"); 
              setDeliveryEstimate(estimate);
          } else {
              setDeliveryEstimate("2-4 Business Days");
          }
      };
      fetchDelivery();
  }, [currentUser]);

  if (!product) return <div className="text-cream text-center py-20">Product Not Found</div>;

  const isWishlisted = isInWishlist(product.id);
  const currentRentalPrice = selectedDuration === 4 ? product.rentalPrice : selectedDuration === 8 ? Math.round(product.rentalPrice * 1.75) : Math.round(product.rentalPrice * 2.4);
  const isAvailable = product.isAvailable !== false;

  const handleTransaction = (type: 'rent' | 'buy') => {
    if (!isAuthenticated) { navigate('/login', { state: { from: location.pathname }}); return; }
    if (currentUser?.verificationStatus !== 'Verified') { alert("Please complete verification in Dashboard to proceed."); return; }
    if (!selectedSize) { alert("Please select a size."); return; }
    if (type === 'rent' && !startDate) { alert("Please select a rental start date."); return; }

    addToCart({
        id: `${product.id}-${Date.now()}`,
        product,
        selectedSize,
        type,
        price: type === 'rent' ? currentRentalPrice : (product.buyPrice || 0),
        duration: type === 'rent' ? selectedDuration : undefined,
        startDate: type === 'rent' && startDate ? startDate.toLocaleDateString() : undefined,
        endDate: type === 'rent' && startDate ? new Date(startDate.getTime() + selectedDuration * 86400000).toLocaleDateString() : undefined
    });
    alert(`${type === 'rent' ? 'Rental' : 'Purchase'} added to bag.`);
  };

  const handleMetaverseConfirm = (size: string, confidence: number) => {
      setSelectedSize(size);
      setShowMetaverse(false);
      alert(`Mirror Sync Confirmed: Selected size ${size} with ${confidence}% biometric accuracy.`);
  };

  return (
    <div className="min-h-screen bg-espresso pt-8 pb-20 animate-fade-in relative">
        {showMetaverse && (
            <VirtualTryOn product={product} onClose={() => setShowMetaverse(false)} onConfirmFit={handleMetaverseConfirm} />
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link to="/catalog" className="text-golden-orange mb-8 inline-flex items-center gap-2 hover:text-white transition-colors group">
                <div className="w-8 h-8 rounded-full border border-golden-orange/20 flex items-center justify-center group-hover:bg-golden-orange group-hover:text-espresso transition-all">
                    <ArrowLeft size={16}/>
                </div>
                <span className="uppercase tracking-[0.2em] text-[10px] font-bold">Back to Archives</span>
            </Link>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                 {/* LEFT: Massive Visuals */}
                 <div className="space-y-6">
                     <div className="relative aspect-[3/4] w-full bg-black/40 rounded-sm overflow-hidden group border border-white/5">
                         <img src={product.images[activeImageIndex]} className="w-full h-full object-cover shadow-2xl transition-all duration-1000 group-hover:scale-105" alt={product.name} />
                         
                         {/* METAVERSE ENTRY HUD - IMPOSSIBLE TO MISS */}
                         <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                             <div className="absolute inset-0 bg-gradient-to-t from-espresso/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                         </div>

                         <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full px-10">
                            <button 
                                onClick={() => setShowMetaverse(true)}
                                className="w-full bg-golden-orange text-espresso font-black text-xs tracking-[0.3em] py-5 rounded-sm shadow-[0_15px_40px_rgba(225,175,77,0.6)] flex items-center justify-center gap-4 hover:scale-[1.02] transition-all animate-pulse hover:bg-white hover:shadow-[0_0_50px_rgba(255,255,255,0.4)] pointer-events-auto"
                            >
                                <Maximize2 size={20} className="animate-spin-slow" /> 
                                ACTIVATE DIGITAL MIRROR
                            </button>
                         </div>

                         <div className="absolute top-6 left-6 flex items-center gap-3">
                             <div className="bg-espresso/80 backdrop-blur-md px-4 py-2 border border-golden-orange/30 rounded-full flex items-center gap-2">
                                 <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                 <span className="text-[10px] font-bold text-cream uppercase tracking-widest">3D Scan Ready</span>
                             </div>
                         </div>
                         
                         <div className="absolute top-6 right-6 pointer-events-auto">
                            <button onClick={() => toggleWishlist(product)} className={`p-4 rounded-full backdrop-blur-md border border-white/10 transition-all ${isWishlisted ? 'bg-golden-orange text-espresso' : 'bg-black/30 text-cream hover:bg-white/20'}`}>
                                <Heart size={24} className={isWishlisted ? 'fill-current' : ''} />
                            </button>
                         </div>
                     </div>
                     <div className="grid grid-cols-4 gap-4">
                        {product.images.map((img, idx) => (
                            <button key={idx} onClick={() => setActiveImageIndex(idx)} className={`aspect-square rounded-sm overflow-hidden border-2 transition-all ${activeImageIndex === idx ? 'border-golden-orange' : 'border-transparent opacity-40 hover:opacity-100'}`}>
                                <img src={img} className="w-full h-full object-cover" />
                            </button>
                        ))}
                     </div>
                 </div>

                 {/* RIGHT: Sophisticated Selection */}
                 <div className="flex flex-col justify-center">
                    <div className="mb-10">
                        <p className="text-golden-orange uppercase tracking-[0.4em] text-xs font-black mb-2">{product.brand}</p>
                        <h1 className="font-serif text-5xl md:text-6xl text-cream mb-6 leading-[1.1]">{product.name}</h1>
                        <div className="flex items-center gap-6">
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-serif text-golden-orange">${product.rentalPrice}</span>
                                <span className="text-xs text-cream/40 uppercase tracking-widest">/ 4 Day Rental</span>
                            </div>
                            <div className="h-8 w-px bg-white/10"></div>
                            <div className="flex items-center gap-1.5 bg-golden-orange/5 px-3 py-1 rounded border border-golden-orange/20">
                                <Star size={14} className="fill-golden-orange text-golden-orange" />
                                <span className="text-sm font-bold text-golden-orange">4.9</span>
                                <span className="text-[10px] text-cream/40 uppercase tracking-tighter">Verified Review</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#1f0c05] p-10 border border-white/10 rounded-sm shadow-2xl space-y-10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                            <Diamond size={120} className="text-golden-orange" />
                        </div>

                        {/* Size Selection */}
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <label className="text-[10px] uppercase text-cream/40 tracking-[0.2em] font-black">Dimensions</label>
                                <button onClick={() => setShowMetaverse(true)} className="text-golden-orange text-[10px] font-bold uppercase tracking-widest underline flex items-center gap-1.5 hover:text-white transition-colors">
                                    <Sparkles size={12}/> Biometric Sizing Assistant
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-4">
                                {product.availableSizes.map(s => (
                                    <button key={s} onClick={() => setSelectedSize(s)} className={`px-6 py-4 border transition-all text-xs font-black tracking-widest rounded-sm ${selectedSize === s ? 'bg-golden-orange text-espresso border-golden-orange shadow-lg' : 'border-white/10 text-cream/60 hover:border-white hover:text-white hover:bg-white/5'}`}>{s}</button>
                                ))}
                            </div>
                        </div>

                        {/* Rental Calendar */}
                        <div>
                            <label className="text-[10px] uppercase text-cream/40 tracking-[0.2em] font-black mb-4 block">Reservation Date</label>
                            <div className="relative group">
                                <input 
                                    type="date" 
                                    onChange={(e) => setStartDate(new Date(e.target.value))}
                                    className="w-full bg-black/20 border border-white/10 p-4 text-cream focus:border-golden-orange outline-none text-xs uppercase font-bold tracking-widest cursor-pointer" 
                                />
                                <CalendarIcon className="absolute right-4 top-4 text-golden-orange pointer-events-none" size={16} />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-4 space-y-4">
                            <Button fullWidth onClick={() => handleTransaction('rent')} className="py-5 text-sm font-black tracking-[0.3em] shadow-[0_0_30px_rgba(225,175,77,0.2)]">
                                ADD TO BAG - RENT
                            </Button>
                            {product.isForSale && (
                                <button onClick={() => handleTransaction('buy')} className="w-full bg-transparent border border-white/10 text-cream hover:bg-white hover:text-espresso py-5 text-[10px] font-black tracking-[0.3em] uppercase transition-all flex items-center justify-center gap-2">
                                    <DollarSign size={14}/> Purchase Ownership - ${product.buyPrice}
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="mt-12 grid grid-cols-2 gap-8">
                        <div className="flex items-start gap-4">
                            <Shield className="text-golden-orange shrink-0" size={20} />
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-cream mb-1">Authenticity Guaranteed</p>
                                <p className="text-xs text-cream/40 font-light">Verified by high-precision digital fingerprinting.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <Shield className="text-golden-orange shrink-0" size={20} />
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-cream mb-1">Authenticity Guaranteed</p>
                                <p className="text-xs text-cream/40 font-light">Verified by high-precision digital fingerprinting.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <Clock className="text-golden-orange shrink-0" size={20} />
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-cream mb-1">Professional Care</p>
                                <p className="text-xs text-cream/40 font-light">Dry cleaning and restoration included in all rentals.</p>
                            </div>
                        </div>
                    </div>
                 </div>
            </div>
        </div>
    </div>
  );
};
