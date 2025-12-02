import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Shield, Clock, Calendar, Check, ArrowLeft, Ruler, Star, Truck, RotateCcw, AlertTriangle, X } from 'lucide-react';
import { useProduct } from '../context/ProductContext';
import { useCart } from '../context/CartContext';

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products } = useProduct();
  const { addToCart } = useCart();
  const product = products.find(p => p.id === id);
  
  const [selectedDuration, setSelectedDuration] = useState<4 | 8 | 12>(4);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [startDate, setStartDate] = useState<string>('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showAgreementModal, setShowAgreementModal] = useState(false);

  if (!product) {
    return (
      <div className="min-h-screen bg-espresso flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-serif text-3xl text-cream mb-4">Product Not Found</h2>
          <Link to="/catalog">
            <Button variant="outline">Return to Collection</Button>
          </Link>
        </div>
      </div>
    );
  }

  const getPrice = (days: number) => {
    const base = product.rentalPrice;
    if (days === 8) return Math.round(base * 1.75);
    if (days === 12) return Math.round(base * 2.4);
    return base;
  };

  const currentPrice = getPrice(selectedDuration);

  // Calculate End Date
  const getEndDate = (start: string, days: number) => {
    if (!start) return null;
    // Create date as local time to avoid UTC offsets shifting the day
    const date = new Date(start + 'T00:00:00'); 
    date.setDate(date.getDate() + days);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const endDateString = getEndDate(startDate, selectedDuration);

  const handleRent = () => {
    if (!selectedSize || !startDate || !agreedToTerms) return;
    
    // Navigate to dashboard with rental details including calculated return date
    navigate('/dashboard', { 
        state: { 
            newRental: {
                product,
                size: selectedSize,
                duration: selectedDuration,
                price: currentPrice,
                date: new Date(startDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                returnDate: endDateString
            }
        } 
    });
  };

  const handleAddToBag = () => {
    if (!selectedSize || !startDate || !agreedToTerms) {
        alert("Please select a size, start date, and agree to the terms.");
        return;
    }
    
    const cartItem = {
        id: `${product.id}-${Date.now()}`,
        product,
        selectedSize,
        duration: selectedDuration,
        price: currentPrice,
        startDate: new Date(startDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        endDate: endDateString || ''
    };

    addToCart(cartItem);
    alert("Item added to your shopping bag.");
  };

  const handleSizeGuide = () => {
      alert("Stylus Sizing Guide:\n\nWe use standard Italian sizing for most garments.\n\nXS / IT 38 / US 2\nS / IT 40 / US 4\nM / IT 42 / US 6\nL / IT 44 / US 8\n\nFor accessories, 'One Size' fits all.");
  };

  // Set minimum date to today
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-espresso pt-8 pb-20 animate-fade-in relative">
      
      {/* Rental Agreement Modal */}
      {showAgreementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1f0c05] border border-golden-orange w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-sm relative shadow-[0_0_50px_rgba(0,0,0,0.8)]">
             <button 
                onClick={() => setShowAgreementModal(false)}
                className="absolute top-4 right-4 text-cream/50 hover:text-golden-orange transition-colors"
             >
                <X size={24} />
             </button>
             
             <div className="p-8">
                <h2 className="font-serif text-3xl text-golden-orange mb-6 text-center">Rental Agreement</h2>
                <div className="space-y-4 text-cream/80 font-light leading-relaxed text-sm h-[50vh] overflow-y-auto pr-4 custom-scrollbar">
                    <p><strong>1. Introduction.</strong> This Rental Agreement ("Agreement") serves as a binding contract between you ("Renter") and Stylus Luxury Rentals ("Stylus"). By clicking "I Agree" or proceeding with a transaction, you accept the terms outlined below.</p>
                    
                    <p><strong>2. Ownership.</strong> All rental items remain the sole property of Stylus. This transaction is a temporary lease, not a sale.</p>
                    
                    <p><strong>3. Condition of Items.</strong> We guarantee that items are authentic, cleaned, and inspected prior to shipment. You agree to treat all items with extreme care. You are responsible for loss, theft, or irreparable damage (e.g., major tears, burns, permanent stains).</p>
                    
                    <p><strong>4. Returns & Late Fees.</strong> Items must be postmarked for return by the "Return Due" date listed on your receipt. Late returns disrupt our ability to serve other clients. 
                    <br/><br/>
                    <span className="text-golden-orange">Late Fee Policy:</span> A fee of 20% of the total rental cost will be charged for each day the item is late, up to 100% of the retail value of the item.</p>
                    
                    <p><strong>5. Cancellations.</strong> You may cancel your order for a full refund up to 48 hours before the scheduled dispatch date. Cancellations made within 48 hours of dispatch are subject to a 50% restocking fee.</p>

                    <p><strong>6. Insurance.</strong> A minor damage waiver is included in your rental price, covering small spills (e.g., wine, coffee) and loose hems. It does not cover major damage or theft.</p>
                </div>
                
                <div className="mt-8 flex justify-center">
                    <Button onClick={() => { setAgreedToTerms(true); setShowAgreementModal(false); }} fullWidth>
                        I Understand & Agree
                    </Button>
                </div>
             </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <div className="mb-8 flex items-center justify-between">
          <Link to="/catalog" className="text-sm text-golden-orange hover:text-cream transition-colors flex items-center uppercase tracking-widest">
            <ArrowLeft size={16} className="mr-2" /> Back to Collection
          </Link>
          <div className="hidden md:block text-xs text-cream/30 uppercase tracking-widest">
             ID: {product.id.padStart(4, '0')}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20">
          
          {/* Enhanced Image Gallery */}
          <div className="space-y-4">
             <div className="h-[600px] lg:h-[800px] w-full bg-cream/5 relative overflow-hidden group rounded-sm shadow-2xl">
                <img 
                  src={product.images[activeImageIndex]} 
                  alt={product.name} 
                  className="w-full h-full object-cover transition-transform duration-700"
                />
             </div>
             {/* Thumbnails */}
             {product.images.length > 1 && (
               <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
                 {product.images.map((img, idx) => (
                   <button 
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`h-24 w-24 flex-shrink-0 border-2 transition-all ${activeImageIndex === idx ? 'border-golden-orange opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                   >
                     <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                   </button>
                 ))}
               </div>
             )}
          </div>

          {/* Details & Booking */}
          <div className="flex flex-col">
            <div className="mb-2">
              <span className="text-golden-orange font-bold uppercase tracking-widest text-sm bg-golden-orange/10 px-2 py-1 rounded">{product.brand}</span>
            </div>
            <h1 className="font-serif text-4xl lg:text-5xl text-cream mb-6 leading-tight">{product.name}</h1>
            
            <div className="flex items-center space-x-6 mb-8 border-b border-white/10 pb-8">
              <div>
                <p className="text-4xl font-serif text-cream animate-fade-in">${currentPrice}</p>
                <p className="text-xs text-golden-orange uppercase tracking-wide font-bold mt-1">Rental Cost</p>
              </div>
              <div className="h-12 w-px bg-white/10"></div>
              <div>
                <p className="text-xl font-serif text-cream/60 line-through">${product.retailPrice}</p>
                <p className="text-xs text-cream/50 uppercase tracking-wide mt-1">Retail Value</p>
              </div>
            </div>

            <p className="text-cream/80 leading-relaxed mb-8 font-light text-lg">
              {product.description}
            </p>

            <div className="bg-[#1f0c05] p-6 border border-white/5 rounded-sm shadow-lg mb-8">
                {/* Size Selector */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                     <h4 className="text-sm text-cream/80 uppercase tracking-widest font-bold">1. Select Size</h4>
                     <button onClick={handleSizeGuide} className="flex items-center text-xs text-golden-orange hover:text-white underline decoration-golden-orange/50">
                        <Ruler size={14} className="mr-1" />
                        Size Guide
                     </button>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {product.availableSizes.map(size => (
                      <button 
                        key={size} 
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-[3rem] h-12 px-4 flex items-center justify-center border transition-all duration-300 ${
                          selectedSize === size 
                            ? 'bg-golden-orange border-golden-orange text-espresso font-bold shadow-[0_0_15px_rgba(225,175,77,0.4)]' 
                            : 'border-white/20 text-cream hover:border-golden-orange hover:text-golden-orange'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Booking Calendar / Date Selector */}
                <div className="mb-6">
                    <h4 className="text-sm text-cream/80 uppercase tracking-widest mb-3 font-bold">2. Select Start Date</h4>
                    <div className="relative">
                        <input 
                            type="date" 
                            min={today}
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 text-cream px-4 py-3 rounded-sm focus:outline-none focus:border-golden-orange placeholder-cream/30"
                        />
                        <Calendar className="absolute right-4 top-3 text-cream/30 pointer-events-none" size={20} />
                    </div>
                </div>

                {/* Duration Selector */}
                <div className="mb-6">
                  <h4 className="text-sm text-cream/80 uppercase tracking-widest mb-3 font-bold">3. Select Duration</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {[4, 8, 12].map((days) => (
                       <button 
                        key={days} 
                        onClick={() => setSelectedDuration(days as 4 | 8 | 12)}
                        className={`py-3 px-2 border text-center transition-all duration-300 relative overflow-hidden group ${
                          selectedDuration === days 
                            ? 'bg-gradient-to-br from-white/10 to-white/5 border-golden-orange text-golden-orange shadow-inner' 
                            : 'border-white/20 text-cream hover:border-golden-orange/50 hover:bg-white/5'
                        }`}
                      >
                        <span className="block text-sm font-serif mb-1">{days} Days</span>
                        <span className={`block text-xs ${selectedDuration === days ? 'text-white' : 'text-cream/50'}`}>
                          ${getPrice(days)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Return Date Display */}
                {startDate && (
                  <div className="mb-6 p-4 bg-white/5 border border-white/10 rounded-sm flex justify-between items-center animate-fade-in">
                      <div>
                        <p className="text-xs text-cream/50 uppercase tracking-wide">Rental Period</p>
                        <p className="text-sm text-cream mt-1 font-mono">
                          {new Date(startDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — {endDateString}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-golden-orange uppercase tracking-wide font-bold">Return Due</p>
                        <p className="text-lg text-golden-orange font-bold font-serif">{endDateString}</p>
                      </div>
                  </div>
                )}

                {/* Terms Agreement */}
                <div className="mb-6 p-4 border border-golden-orange/20 bg-golden-orange/5 rounded-sm">
                  <div className="flex gap-3">
                    <div className="pt-1">
                      <input 
                        type="checkbox" 
                        id="rental-terms"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="w-4 h-4 accent-golden-orange cursor-pointer"
                      />
                    </div>
                    <label htmlFor="rental-terms" className="text-xs text-cream/80 leading-relaxed cursor-pointer select-none">
                      I agree to the 
                      <button 
                        onClick={(e) => { e.preventDefault(); setShowAgreementModal(true); }}
                        className="text-golden-orange font-bold hover:underline mx-1 focus:outline-none"
                      >
                        Rental Agreement
                      </button>. 
                      I understand that <span className="text-white font-bold">late returns incur a 20% daily fee</span> based on the total rental price.
                    </label>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    fullWidth 
                    variant="secondary"
                    onClick={handleAddToBag}
                    disabled={!selectedSize || !startDate || !agreedToTerms}
                    className="h-14 text-sm sm:w-1/2"
                  >
                    Add to Bag
                  </Button>
                  <Button 
                    fullWidth 
                    variant="primary"
                    disabled={!selectedSize || !startDate || !agreedToTerms} 
                    onClick={handleRent}
                    className="h-14 text-lg sm:w-1/2"
                  >
                     Rent Now • ${currentPrice}
                  </Button>
                </div>
            </div>

            {/* Clear Policies Section */}
            <div className="border-t border-white/10 pt-8 space-y-4">
                <h4 className="font-serif text-xl text-cream mb-4">Rental Policies</h4>
                <div className="flex items-start space-x-4">
                    <Truck className="text-golden-orange h-6 w-6 mt-1 flex-shrink-0" />
                    <div>
                        <h5 className="font-bold text-cream">Shipping & Delivery</h5>
                        <p className="text-cream/60 text-sm">Complimentary round-trip shipping. Orders placed before 2 PM EST ship same-day.</p>
                    </div>
                </div>
                <div className="flex items-start space-x-4">
                    <AlertTriangle className="text-golden-orange h-6 w-6 mt-1 flex-shrink-0" />
                    <div>
                        <h5 className="font-bold text-cream">Late Returns</h5>
                        <p className="text-cream/60 text-sm">To ensure availability for all members, items returned after {endDateString || 'the due date'} are subject to strict late fees.</p>
                    </div>
                </div>
                <div className="flex items-start space-x-4">
                    <Shield className="text-golden-orange h-6 w-6 mt-1 flex-shrink-0" />
                    <div>
                        <h5 className="font-bold text-cream">Cleaning & Care</h5>
                        <p className="text-cream/60 text-sm">We handle all dry cleaning. Minor spills and wear are covered by our insurance.</p>
                    </div>
                </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="border-t border-white/10 pt-16">
            <h2 className="font-serif text-3xl text-cream mb-10 text-center">Client Experiences</h2>
            
            {product.reviews && product.reviews.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {product.reviews.map((review) => (
                        <div key={review.id} className="bg-white/5 p-6 border border-white/5 rounded-sm">
                            <div className="flex items-center space-x-1 mb-3">
                                {[...Array(5)].map((_, i) => (
                                    <Star 
                                        key={i} 
                                        size={14} 
                                        className={i < review.rating ? "fill-golden-orange text-golden-orange" : "text-gray-600"} 
                                    />
                                ))}
                            </div>
                            <p className="text-cream/80 italic mb-4">"{review.comment}"</p>
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-golden-orange uppercase tracking-wider">{review.author}</span>
                                <span className="text-xs text-cream/40">{new Date(review.date).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-cream/50 italic">No reviews yet for this exclusive piece. Be the first to rent.</p>
            )}
        </div>

      </div>
    </div>
  );
};