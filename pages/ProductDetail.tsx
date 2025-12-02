import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Shield, Clock, Calendar, Check, ArrowLeft, Ruler, Star, Truck, RotateCcw } from 'lucide-react';
import { useProduct } from '../context/ProductContext';

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products } = useProduct();
  const product = products.find(p => p.id === id);
  
  const [selectedDuration, setSelectedDuration] = useState<4 | 8 | 12>(4);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [startDate, setStartDate] = useState<string>('');

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

  const handleRent = () => {
    if (!selectedSize || !startDate) return;
    
    // Navigate to dashboard with rental details
    navigate('/dashboard', { 
        state: { 
            newRental: {
                product,
                size: selectedSize,
                duration: selectedDuration,
                price: currentPrice,
                date: new Date(startDate).toLocaleDateString()
            }
        } 
    });
  };

  const handleSizeGuide = () => {
      alert("Stylus Sizing Guide:\n\nWe use standard Italian sizing for most garments.\n\nXS / IT 38 / US 2\nS / IT 40 / US 4\nM / IT 42 / US 6\nL / IT 44 / US 8\n\nFor accessories, 'One Size' fits all.");
  };

  // Set minimum date to today
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-espresso pt-8 pb-20 animate-fade-in">
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
                <div className="mb-8">
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

                <Button 
                  fullWidth 
                  disabled={!selectedSize || !startDate} 
                  onClick={handleRent}
                  className="h-14 text-lg"
                >
                  {!selectedSize ? 'Select Size to Rent' : !startDate ? 'Select Date to Rent' : `Rent Now • $${currentPrice}`}
                </Button>
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
                    <RotateCcw className="text-golden-orange h-6 w-6 mt-1 flex-shrink-0" />
                    <div>
                        <h5 className="font-bold text-cream">Easy Returns</h5>
                        <p className="text-cream/60 text-sm">Simply pack the item in the reusable bag and attach the pre-paid label. Drop off at any courier location.</p>
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