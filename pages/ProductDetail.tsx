
import React, { useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/Button';
import { Shield, Clock, Calendar, Check, ArrowLeft, Ruler, Star, Truck, AlertTriangle, X, Heart, ShoppingBag, Lock, DollarSign } from 'lucide-react';
import { useProduct } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';

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
  const [startDate, setStartDate] = useState<string>('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  if (!product) return <div className="text-cream text-center py-20">Product Not Found</div>;

  const isWishlisted = isInWishlist(product.id);
  const currentRentalPrice = selectedDuration === 4 ? product.rentalPrice : selectedDuration === 8 ? Math.round(product.rentalPrice * 1.75) : Math.round(product.rentalPrice * 2.4);

  const checkAccess = () => {
      if (!isAuthenticated) {
          navigate('/login', { state: { from: location.pathname }});
          return false;
      }
      if (currentUser?.verificationStatus !== 'Verified') {
          alert("Action Restricted: Please complete your identity verification in the Dashboard to Rent or Buy.");
          return false;
      }
      return true;
  };

  const handleTransaction = (type: 'rent' | 'buy') => {
    if (!checkAccess()) return;
    if (!selectedSize) { alert("Please select a size."); return; }
    if (type === 'rent' && (!startDate || !agreedToTerms)) { alert("Please select dates and agree to terms."); return; }

    addToCart({
        id: `${product.id}-${Date.now()}`,
        product,
        selectedSize,
        type,
        price: type === 'rent' ? currentRentalPrice : (product.buyPrice || 0),
        duration: type === 'rent' ? selectedDuration : undefined,
        startDate: type === 'rent' ? startDate : undefined,
        endDate: type === 'rent' ? new Date(startDate).toLocaleDateString() : undefined
    });
    alert(`${type === 'rent' ? 'Rental' : 'Purchase'} added to bag.`);
  };

  return (
    <div className="min-h-screen bg-espresso pt-8 pb-20 animate-fade-in relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link to="/catalog" className="text-golden-orange mb-8 inline-flex items-center gap-2 hover:text-white transition-colors">&larr; Back to Collection</Link>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                 {/* Image Gallery */}
                 <div>
                     <div className="mb-4 relative h-[600px] w-full">
                         <img src={product.images[activeImageIndex]} className="w-full h-full object-cover shadow-2xl" alt={product.name} />
                     </div>
                     <div className="flex gap-4 overflow-x-auto pb-2">
                         {product.images.map((img, idx) => (
                             <button key={idx} onClick={() => setActiveImageIndex(idx)} className={`w-20 h-24 flex-shrink-0 border-2 ${activeImageIndex === idx ? 'border-golden-orange' : 'border-transparent'} hover:border-white/50 transition-colors`}>
                                 <img src={img} className="w-full h-full object-cover" alt="" />
                             </button>
                         ))}
                     </div>
                 </div>

                 {/* Product Details */}
                 <div>
                     <h1 className="font-serif text-4xl text-cream mb-2">{product.name}</h1>
                     <p className="text-golden-orange uppercase tracking-widest text-sm mb-6">{product.brand}</p>
                     
                     {/* Prices */}
                     <div className="flex gap-12 mb-8 border-b border-white/10 pb-6">
                         <div>
                             <p className="text-3xl font-serif text-cream">${currentRentalPrice}</p>
                             <p className="text-xs text-cream/50 uppercase tracking-widest mt-1">Rent (4 Days)</p>
                         </div>
                         {product.isForSale && (
                             <div>
                                 <p className="text-3xl font-serif text-golden-orange">${product.buyPrice}</p>
                                 <p className="text-xs text-cream/50 uppercase tracking-widest mt-1">Buy Now</p>
                             </div>
                         )}
                     </div>

                     {/* Configuration */}
                     <div className="bg-[#1f0c05] p-8 border border-white/10 mb-8 shadow-xl">
                         <div className="mb-6">
                             <p className="text-xs uppercase text-cream/60 mb-3 tracking-widest">Select Size</p>
                             <div className="flex flex-wrap gap-3">
                                 {product.availableSizes.map(s => (
                                     <button key={s} onClick={() => setSelectedSize(s)} className={`min-w-[50px] px-4 py-2 border transition-colors ${selectedSize === s ? 'bg-golden-orange text-espresso border-golden-orange font-bold' : 'border-white/20 text-cream hover:border-white'}`}>{s}</button>
                                 ))}
                             </div>
                         </div>
                         
                         {/* Rental Specifics */}
                         <div className="mb-6 p-4 bg-black/20 border border-white/5">
                             <div className="flex items-center gap-2 mb-4">
                                <Calendar size={16} className="text-golden-orange"/>
                                <span className="text-xs uppercase text-cream/80 tracking-widest">Rental Details</span>
                             </div>
                             <div className="grid grid-cols-2 gap-4">
                                 <div>
                                     <label className="text-[10px] text-cream/40 uppercase block mb-1">Start Date</label>
                                     <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-white/5 border border-white/10 text-cream p-2 w-full text-sm" />
                                 </div>
                                 <div>
                                     <label className="text-[10px] text-cream/40 uppercase block mb-1">Duration</label>
                                     <select 
                                        value={selectedDuration} 
                                        onChange={(e) => setSelectedDuration(Number(e.target.value) as any)}
                                        className="bg-white/5 border border-white/10 text-cream p-2 w-full text-sm"
                                     >
                                         <option value={4}>4 Days (${product.rentalPrice})</option>
                                         <option value={8}>8 Days (${Math.round(product.rentalPrice * 1.75)})</option>
                                         <option value={12}>12 Days (${Math.round(product.rentalPrice * 2.4)})</option>
                                     </select>
                                 </div>
                             </div>
                         </div>
                         
                         <div className="flex items-center gap-2 mb-6">
                             <input type="checkbox" checked={agreedToTerms} onChange={e => setAgreedToTerms(e.target.checked)} className="accent-golden-orange w-4 h-4" />
                             <span className="text-xs text-cream/70">I agree to the <span className="underline cursor-pointer hover:text-white">Rental Agreement</span> & damage policy.</span>
                         </div>

                         <div className="flex flex-col gap-4">
                             <Button fullWidth onClick={() => handleTransaction('rent')} disabled={!isAuthenticated || currentUser?.verificationStatus !== 'Verified'}>
                                 Rent Now
                             </Button>
                             {product.isForSale && (
                                 <Button fullWidth variant="secondary" onClick={() => handleTransaction('buy')} disabled={!isAuthenticated || currentUser?.verificationStatus !== 'Verified'}>
                                     Purchase Item
                                 </Button>
                             )}
                         </div>

                         {(!isAuthenticated || currentUser?.verificationStatus !== 'Verified') && (
                             <div className="mt-6 bg-red-900/20 border border-red-500/30 p-4 flex items-start gap-3 rounded-sm">
                                 <Lock size={16} className="text-red-400 mt-0.5"/> 
                                 <div>
                                     <p className="text-red-300 text-sm font-bold">Verification Required</p>
                                     <p className="text-red-400/70 text-xs mt-1">To maintain exclusivity and security, you must verify your identity in the Dashboard before transacting.</p>
                                     <Link to="/dashboard" className="text-xs text-red-300 underline mt-2 inline-block">Go to Dashboard</Link>
                                 </div>
                             </div>
                         )}
                     </div>

                     <div className="border-t border-white/10 pt-8">
                         <h3 className="font-serif text-xl text-cream mb-4">Product Details</h3>
                         <p className="text-cream/70 leading-relaxed font-light">{product.description}</p>
                         <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-cream/60">
                             <p>Color: {product.color}</p>
                             <p>Occasion: {product.occasion}</p>
                             <p>Condition: Excellent (Verified)</p>
                             <p>Reference: {product.id.substring(0,6)}</p>
                         </div>
                     </div>
                 </div>
            </div>
        </div>
    </div>
  );
};
