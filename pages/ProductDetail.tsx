import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MOCK_PRODUCTS } from '../constants';
import { Button } from '../components/Button';
import { Shield, Clock, Calendar, Check, ArrowLeft, Ruler } from 'lucide-react';

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const product = MOCK_PRODUCTS.find(p => p.id === id);
  
  const [selectedDuration, setSelectedDuration] = useState<4 | 8 | 12>(4);
  const [selectedSize, setSelectedSize] = useState<string>('');

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
    if (!selectedSize) return;
    
    // Navigate to dashboard with rental details
    navigate('/dashboard', { 
        state: { 
            newRental: {
                product,
                size: selectedSize,
                duration: selectedDuration,
                price: currentPrice,
                date: new Date().toLocaleDateString()
            }
        } 
    });
  };

  const handleSizeGuide = () => {
      alert("Stylus Sizing Guide:\n\nWe use standard Italian sizing for most garments.\n\nXS / IT 38 / US 2\nS / IT 40 / US 4\nM / IT 42 / US 6\nL / IT 44 / US 8\n\nFor accessories, 'One Size' fits all.");
  };

  return (
    <div className="min-h-screen bg-espresso pt-8 pb-20 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb / Back */}
        <div className="mb-8 flex items-center justify-between">
          <Link to="/catalog" className="text-sm text-golden-orange hover:text-cream transition-colors flex items-center uppercase tracking-widest">
            <ArrowLeft size={16} className="mr-2" /> Back to Collection
          </Link>
          <div className="hidden md:block text-xs text-cream/30 uppercase tracking-widest">
             ID: {product.id.padStart(4, '0')}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Image */}
          <div className="h-[600px] lg:h-[800px] w-full bg-cream/5 relative overflow-hidden group rounded-sm shadow-2xl">
            <img 
              src={product.imageUrl} 
              alt={product.name} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-espresso/50 to-transparent opacity-50"></div>
          </div>

          {/* Details */}
          <div className="flex flex-col justify-center">
            <div className="mb-2">
              <span className="text-golden-orange font-bold uppercase tracking-widest text-sm bg-golden-orange/10 px-2 py-1 rounded">{product.brand}</span>
            </div>
            <h1 className="font-serif text-4xl lg:text-5xl text-cream mb-6 leading-tight">{product.name}</h1>
            
            <div className="flex items-center space-x-6 mb-8 border-b border-white/10 pb-8">
              <div>
                <p className="text-4xl font-serif text-cream animate-fade-in">${currentPrice}</p>
                <p className="text-xs text-golden-orange uppercase tracking-wide font-bold mt-1">Rental ({selectedDuration} Days)</p>
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

            {/* Size Selector */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                 <h4 className="text-sm text-cream/80 uppercase tracking-widest font-bold">Select Size</h4>
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
                        ? 'bg-golden-orange border-golden-orange text-espresso font-bold shadow-[0_0_15px_rgba(225,175,77,0.4)] transform scale-105' 
                        : 'border-white/20 text-cream hover:border-golden-orange hover:text-golden-orange'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              {!selectedSize && <p className="text-red-400 text-xs mt-2 animate-pulse">* Please select a size to proceed</p>}
            </div>

            {/* Duration Selector */}
            <div className="mb-10">
              <h4 className="text-sm text-cream/80 uppercase tracking-widest mb-4 font-bold">Rental Duration</h4>
              <div className="grid grid-cols-3 gap-4">
                {[4, 8, 12].map((days) => (
                   <button 
                    key={days} 
                    onClick={() => setSelectedDuration(days as 4 | 8 | 12)}
                    className={`py-4 px-2 border text-center transition-all duration-300 relative overflow-hidden group ${
                      selectedDuration === days 
                        ? 'bg-gradient-to-br from-white/10 to-white/5 border-golden-orange text-golden-orange shadow-[0_0_20px_rgba(225,175,77,0.1)]' 
                        : 'border-white/20 text-cream hover:border-golden-orange/50 hover:bg-white/5'
                    }`}
                  >
                    <span className="block text-base font-serif mb-1">{days} Days</span>
                    <span className={`block text-xs uppercase tracking-wide ${selectedDuration === days ? 'text-white' : 'text-cream/50'}`}>
                      ${getPrice(days)}
                    </span>
                    {selectedDuration === days && (
                      <div className="absolute top-0 right-0 p-1">
                        <div className="w-1.5 h-1.5 bg-golden-orange rounded-full"></div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4 mb-10">
              <Button 
                fullWidth 
                disabled={!selectedSize} 
                onClick={handleRent}
                className="h-14 text-lg"
              >
                {selectedSize ? `Rent Now • $${currentPrice}` : 'Select Size to Rent'}
              </Button>
              <p className="text-center text-xs text-cream/40 uppercase tracking-widest">
                Free cancellation within 24 hours of booking
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-6 bg-white/[0.03] p-6 border border-white/5 rounded-sm">
              <div className="flex items-start space-x-3">
                <Shield className="text-golden-orange h-5 w-5 mt-1 shrink-0" />
                <div>
                  <h5 className="text-cream font-bold text-sm mb-1">Insurance Included</h5>
                  <p className="text-cream/50 text-xs">Minor damage coverage</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Clock className="text-golden-orange h-5 w-5 mt-1 shrink-0" />
                <div>
                  <h5 className="text-cream font-bold text-sm mb-1">Flexible Returns</h5>
                  <p className="text-cream/50 text-xs">Pre-paid label included</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="text-golden-orange h-5 w-5 mt-1 shrink-0" />
                <div>
                  <h5 className="text-cream font-bold text-sm mb-1">Dry Cleaned</h5>
                  <p className="text-cream/50 text-xs">Professionally treated</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Calendar className="text-golden-orange h-5 w-5 mt-1 shrink-0" />
                <div>
                  <h5 className="text-cream font-bold text-sm mb-1">Book in Advance</h5>
                  <p className="text-cream/50 text-xs">Secure for your date</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
