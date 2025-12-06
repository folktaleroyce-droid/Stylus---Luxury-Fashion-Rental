
import React, { useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/Button';
import { Shield, Clock, Calendar, Check, ArrowLeft, Ruler, Star, Truck, AlertTriangle, X, Heart, ShoppingBag, Lock, DollarSign, ChevronDown, ChevronUp, Info } from 'lucide-react';
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
  const [openPolicy, setOpenPolicy] = useState<string | null>('shipping');

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

  const togglePolicy = (policy: string) => {
    setOpenPolicy(openPolicy === policy ? null : policy);
  };

  return (
    <div className="min-h-screen bg-espresso pt-8 pb-20 animate-fade-in relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link to="/catalog" className="text-golden-orange mb-8 inline-flex items-center gap-2 hover:text-white transition-colors">&larr; Back to Collection</Link>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                 {/* Image Gallery - Multiple Views */}
                 <div>
                     <div className="mb-4 relative h-[600px] w-full bg-black/20 rounded-sm overflow-hidden group">
                         <img src={product.images[activeImageIndex]} className="w-full h-full object-cover shadow-2xl transition-transform duration-500 group-hover:scale-105" alt={product.name} />
                         <div className="absolute top-4 right-4 flex gap-2">
                             <button onClick={() => toggleWishlist(product)} className={`p-3 rounded-full backdrop-blur-md transition-all ${isWishlisted ? 'bg-golden-orange text-espresso' : 'bg-black/30 text-cream hover:bg-white/20'}`}>
                                 <Heart size={20} className={isWishlisted ? 'fill-current' : ''} />
                             </button>
                         </div>
                     </div>
                     <div className="grid grid-cols-4 gap-4">
                         {product.images.map((img, idx) => (
                             <button key={idx} onClick={() => setActiveImageIndex(idx)} className={`w-full aspect-[3/4] border-2 rounded-sm overflow-hidden transition-all ${activeImageIndex === idx ? 'border-golden-orange opacity-100 scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                                 <img src={img} className="w-full h-full object-cover" alt="" />
                             </button>
                         ))}
                     </div>
                 </div>

                 {/* Product Details & Booking */}
                 <div>
                     <div className="flex justify-between items-start mb-2">
                        <div>
                            <p className="text-golden-orange uppercase tracking-widest text-sm font-bold mb-1">{product.brand}</p>
                            <h1 className="font-serif text-4xl text-cream mb-2 leading-tight">{product.name}</h1>
                        </div>
                        {product.reviews.length > 0 && (
                            <div className="flex items-center gap-1 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                                <Star size={14} className="fill-golden-orange text-golden-orange" />
                                <span className="text-sm font-bold text-cream">
                                    {(product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length).toFixed(1)}
                                </span>
                                <span className="text-xs text-cream/50 underline cursor-pointer ml-1">View Reviews</span>
                            </div>
                        )}
                     </div>
                     
                     {/* Prices */}
                     <div className="flex flex-wrap items-end gap-8 mb-8 border-b border-white/10 pb-6">
                         <div className="bg-[#2a1208] px-6 py-4 rounded border border-golden-orange/20 relative overflow-hidden">
                             <div className="absolute top-0 right-0 w-16 h-16 bg-golden-orange/10 rounded-bl-full"></div>
                             <p className="text-xs text-cream/50 uppercase tracking-widest mb-1">Rent from</p>
                             <div className="flex items-baseline gap-1">
                                <p className="text-3xl font-serif text-cream">${currentRentalPrice}</p>
                                <p className="text-sm text-cream/50">/ 4 Days</p>
                             </div>
                         </div>
                         {product.isForSale && (
                             <div>
                                 <p className="text-3xl font-serif text-golden-orange">${product.buyPrice}</p>
                                 <p className="text-xs text-cream/50 uppercase tracking-widest mt-1">Buy Price</p>
                             </div>
                         )}
                     </div>

                     {/* Main Booking Interface */}
                     <div className="bg-[#1f0c05] p-8 border border-white/10 mb-8 shadow-xl rounded-sm">
                         <div className="mb-6">
                             <div className="flex justify-between items-center mb-3">
                                <p className="text-xs uppercase text-cream/60 tracking-widest font-bold">Select Size</p>
                                <button className="text-xs text-golden-orange underline flex items-center gap-1"><Ruler size={12}/> Size Guide</button>
                             </div>
                             <div className="flex flex-wrap gap-3">
                                 {product.availableSizes.map(s => (
                                     <button key={s} onClick={() => setSelectedSize(s)} className={`min-w-[50px] px-4 py-3 border transition-all text-sm font-medium rounded-sm ${selectedSize === s ? 'bg-golden-orange text-espresso border-golden-orange font-bold shadow-lg scale-105' : 'border-white/20 text-cream hover:border-white hover:bg-white/5'}`}>{s}</button>
                                 ))}
                             </div>
                         </div>
                         
                         {/* Rental Specifics */}
                         <div className="mb-6 p-5 bg-black/20 border border-white/5 rounded-sm">
                             <div className="flex items-center gap-2 mb-4">
                                <Calendar size={16} className="text-golden-orange"/>
                                <span className="text-xs uppercase text-cream/80 tracking-widest font-bold">Rental Period</span>
                             </div>
                             <div className="grid grid-cols-2 gap-4">
                                 <div>
                                     <label className="text-[10px] text-cream/40 uppercase block mb-1">Start Date</label>
                                     <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-white/5 border border-white/10 text-cream p-3 w-full text-sm rounded-sm focus:border-golden-orange outline-none" />
                                 </div>
                                 <div>
                                     <label className="text-[10px] text-cream/40 uppercase block mb-1">Duration</label>
                                     <select 
                                        value={selectedDuration} 
                                        onChange={(e) => setSelectedDuration(Number(e.target.value) as any)}
                                        className="bg-white/5 border border-white/10 text-cream p-3 w-full text-sm rounded-sm focus:border-golden-orange outline-none"
                                     >
                                         <option value={4}>4 Days (Standard)</option>
                                         <option value={8}>8 Days (Extended)</option>
                                         <option value={12}>12 Days (Long Term)</option>
                                     </select>
                                 </div>
                             </div>
                         </div>
                         
                         <div className="flex items-center gap-2 mb-6">
                             <input type="checkbox" checked={agreedToTerms} onChange={e => setAgreedToTerms(e.target.checked)} className="accent-golden-orange w-4 h-4 cursor-pointer" />
                             <span className="text-xs text-cream/70">I agree to the <span className="underline cursor-pointer hover:text-white">Rental Policy</span> & coverage terms.</span>
                         </div>

                         {/* Action Buttons - Side by Side */}
                         <div className="flex flex-col sm:flex-row gap-4">
                             <Button 
                                fullWidth 
                                onClick={() => handleTransaction('rent')} 
                                disabled={!isAuthenticated || currentUser?.verificationStatus !== 'Verified'} 
                                className="flex-1 py-4 text-base font-bold tracking-widest shadow-[0_0_20px_rgba(225,175,77,0.2)]"
                             >
                                 RENT NOW
                             </Button>
                             {product.isForSale && (
                                 <Button 
                                    fullWidth 
                                    variant="secondary" 
                                    onClick={() => handleTransaction('buy')} 
                                    disabled={!isAuthenticated || currentUser?.verificationStatus !== 'Verified'}
                                    className="flex-1 py-4 text-base font-bold tracking-widest"
                                >
                                     BUY NOW (${product.buyPrice})
                                 </Button>
                             )}
                         </div>

                         {(!isAuthenticated || currentUser?.verificationStatus !== 'Verified') && (
                             <div className="mt-6 bg-red-900/10 border border-red-500/20 p-4 flex items-start gap-3 rounded-sm">
                                 <Lock size={16} className="text-red-400 mt-0.5 shrink-0"/> 
                                 <div>
                                     <p className="text-red-300 text-sm font-bold">Account Verification Required</p>
                                     <p className="text-red-400/70 text-xs mt-1">Complete verification in dashboard to unlock rentals and purchases.</p>
                                     <Link to="/dashboard" className="text-xs text-red-300 underline mt-2 inline-block hover:text-white">Go to Verification</Link>
                                 </div>
                             </div>
                         )}
                     </div>

                     <div className="space-y-6">
                         <div className="border-t border-white/10 pt-6">
                             <h3 className="font-serif text-xl text-cream mb-4">Description</h3>
                             <p className="text-cream/70 leading-relaxed font-light text-sm">{product.description}</p>
                             <div className="mt-4 flex flex-wrap gap-4 text-xs text-cream/60">
                                 <span className="bg-white/5 px-3 py-1 rounded border border-white/5 uppercase tracking-wider">Color: {product.color}</span>
                                 <span className="bg-white/5 px-3 py-1 rounded border border-white/5 uppercase tracking-wider">Occasion: {product.occasion}</span>
                                 <span className="bg-white/5 px-3 py-1 rounded border border-white/5 flex items-center gap-1 uppercase tracking-wider text-green-400"><Shield size={10}/> Verified Authentic</span>
                             </div>
                         </div>

                         {/* Rental Policies Accordion */}
                         <div className="border-t border-white/10 pt-4">
                             <h3 className="text-xs uppercase text-cream/40 font-bold tracking-widest mb-4">Rental Policies & Guarantees</h3>
                             {[
                                 { id: 'shipping', title: 'Shipping & Returns', icon: <Truck size={16}/>, content: "We offer secure, insured delivery via premium courier services. Orders placed before 2 PM EST are dispatched the same day. A pre-paid return label is included in the box for your convenience." },
                                 { id: 'cleaning', title: 'Cleaning & Care', icon: <Clock size={16}/>, content: "Professional dry cleaning is included in your rental fee. Please do not attempt to clean the item yourself. Simply place the item back in the reusable Stylus garment bag." },
                                 { id: 'insurance', title: 'Damage & Insurance', icon: <Shield size={16}/>, content: "Minor wear and tear (e.g., loose threads, missing buttons) is covered. Significant damage or stains may incur a repair fee. Optional full insurance is available at checkout for $15." }
                             ].map((item) => (
                                 <div key={item.id} className="border-b border-white/5">
                                     <button 
                                        onClick={() => togglePolicy(item.id)} 
                                        className="w-full py-4 flex items-center justify-between text-left hover:text-golden-orange transition-colors"
                                     >
                                         <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-wide text-cream/80">
                                             {item.icon} {item.title}
                                         </div>
                                         {openPolicy === item.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                     </button>
                                     {openPolicy === item.id && (
                                         <div className="pb-4 pl-7 pr-4 text-sm text-cream/60 leading-relaxed animate-fade-in">
                                             {item.content}
                                         </div>
                                     )}
                                 </div>
                             ))}
                         </div>

                         {/* Reviews Section */}
                         <div className="border-t border-white/10 pt-8">
                             <h3 className="font-serif text-xl text-cream mb-6 flex items-center gap-2">
                                 Client Reviews 
                                 <span className="text-sm font-sans text-cream/40 font-normal">({product.reviews.length})</span>
                             </h3>
                             
                             {product.reviews.length === 0 ? (
                                 <div className="bg-white/5 p-6 text-center border border-white/5 rounded-sm">
                                     <p className="text-cream/50 italic text-sm">No reviews yet.</p>
                                     <p className="text-xs text-cream/30 mt-1">Be the first to rent this item and share your experience.</p>
                                 </div>
                             ) : (
                                 <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                     {product.reviews.map(review => (
                                         <div key={review.id} className="bg-[#1f0c05] p-5 rounded-sm border border-white/5 shadow-md">
                                             <div className="flex justify-between items-start mb-2">
                                                 <div className="flex items-center gap-2">
                                                     <div className="w-8 h-8 rounded-full bg-golden-orange/20 flex items-center justify-center text-golden-orange font-bold text-xs">
                                                         {review.author.charAt(0)}
                                                     </div>
                                                     <span className="font-bold text-cream text-sm">{review.author}</span>
                                                 </div>
                                                 <span className="text-xs text-cream/40">{review.date}</span>
                                             </div>
                                             <div className="flex gap-1 mb-3 pl-10">
                                                 {[...Array(5)].map((_, i) => (
                                                     <Star key={i} size={12} className={i < review.rating ? "fill-golden-orange text-golden-orange" : "text-cream/20"} />
                                                 ))}
                                             </div>
                                             <p className="text-cream/70 text-sm leading-relaxed pl-10">"{review.comment}"</p>
                                         </div>
                                     ))}
                                 </div>
                             )}
                         </div>
                     </div>
                 </div>
            </div>
        </div>
    </div>
  );
};
