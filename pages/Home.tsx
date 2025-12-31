
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { ShieldCheck, Truck, Sparkles, Diamond, ShoppingBag, DollarSign, Star, BrainCircuit, Maximize2, Zap } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useProduct } from '../context/ProductContext';
import { Product } from '../types';

export const Home: React.FC = () => {
  const { products } = useProduct();
  const { addToCart } = useCart();

  const heroImages = [
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=1000&auto=format&fit=crop"
  ];
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(slideInterval);
  }, [heroImages.length]);

  const quickAddToCart = (product: Product) => {
    const today = new Date();
    const endDate = new Date();
    endDate.setDate(today.getDate() + 4);
    
    addToCart({
        id: `${product.id}-${Date.now()}`,
        product: product,
        selectedSize: product.availableSizes[0] || 'One Size',
        duration: 4,
        price: product.rentalPrice,
        startDate: today.toLocaleDateString(),
        endDate: endDate.toLocaleDateString(),
        type: 'rent'
    });
    alert(`${product.name} added to your bag.`);
  };

  return (
    <div className="animate-fade-in relative">
      
      {/* 1. HERO SECTION */}
      <section className="relative h-[95vh] flex items-center justify-center overflow-hidden bg-espresso">
        {heroImages.map((img, index) => (
          <div 
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
          >
            <img src={img} alt="Hero" className="w-full h-full object-cover opacity-40" />
            <div className="absolute inset-0 bg-gradient-to-t from-espresso via-espresso/40 to-transparent"></div>
          </div>
        ))}
        
        <div className="relative z-10 text-center max-w-5xl px-4 animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-golden-orange/10 border border-golden-orange/30 rounded-full text-golden-orange text-[10px] font-bold uppercase tracking-[0.3em] mb-8 animate-pulse">
            <Zap size={14} /> Metaverse Try-On Now Live
          </div>
          <h1 className="font-serif text-6xl md:text-8xl lg:text-9xl text-cream mb-10 leading-tight drop-shadow-2xl">
            Slay in <br/><span className="text-golden-orange italic">3D Reality</span>
          </h1>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/catalog">
                <Button variant="primary" className="text-lg px-12 py-5 shadow-[0_0_30px_rgba(225,175,77,0.4)]">Enter the Collection</Button>
            </Link>
            <Link to="/catalog">
                <Button variant="outline" className="text-lg px-12 py-5 backdrop-blur-md flex items-center gap-3">
                    <Maximize2 size={20}/> Launch Digital Mirror
                </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. THE METAVERSE FITTING ROOM SECTION */}
      <section className="py-32 bg-[#140804] border-y border-golden-orange/10 relative overflow-hidden">
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-golden-orange to-transparent"></div>
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
               <div className="relative">
                  <div className="absolute -inset-4 border border-golden-orange/20 rounded-sm animate-pulse-slow"></div>
                  <div className="relative aspect-[3/4] bg-espresso overflow-hidden border border-white/10 group">
                     <img src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1000&auto=format&fit=crop" className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-1000" />
                     <div className="absolute inset-0 scanline opacity-30"></div>
                     <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-24 h-24 rounded-full bg-golden-orange/20 backdrop-blur-md border border-golden-orange flex items-center justify-center animate-bounce shadow-[0_0_50px_rgba(225,175,77,0.5)]">
                           <Sparkles size={40} className="text-golden-orange" />
                        </div>
                     </div>
                     <div className="absolute bottom-8 left-8 right-8 bg-black/60 backdrop-blur-xl p-6 border border-white/10">
                        <p className="text-golden-orange font-bold text-[10px] uppercase tracking-widest mb-2 flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> Sensor Status: Optimized
                        </p>
                        <h3 className="font-serif text-2xl text-cream">Biometric Fabric Mapping</h3>
                        <p className="text-cream/50 text-xs mt-2 leading-relaxed">Our AI analyzes 32 skeletal points to simulate realistic fabric draping on your unique silhouette.</p>
                     </div>
                  </div>
               </div>
               <div className="space-y-8">
                  <span className="text-golden-orange font-bold uppercase tracking-[0.4em] text-xs">Innovation</span>
                  <h2 className="font-serif text-5xl md:text-6xl text-cream leading-tight">Your Digital <br/> Royal Atelier</h2>
                  <p className="text-cream/70 text-lg leading-relaxed font-light">
                     Experience high-fidelity fashion without the fitting room. Our **Metaverse Digital Mirror** allows you to see how archival Chanel, McQueen, and Tom Ford pieces drape on your body in real-time.
                  </p>
                  <ul className="space-y-6">
                     {[
                        { title: "Real-time Draping", desc: "Proprietary physics engine for silk, velvet, and rigid fabrics." },
                        { title: "Fit Confidence Score", desc: "Get an AI-powered percentage of how well a size fits your metrics." },
                        { title: "Privacy First", desc: "All biometric processing happens locally on your device." }
                     ].map((item, idx) => (
                        <li key={idx} className="flex gap-4">
                           <div className="w-10 h-10 rounded-full bg-golden-orange/10 flex items-center justify-center shrink-0 border border-golden-orange/20">
                              <Check className="text-golden-orange" size={18} />
                           </div>
                           <div>
                              <h4 className="text-cream font-bold uppercase text-xs tracking-widest mb-1">{item.title}</h4>
                              <p className="text-cream/50 text-sm">{item.desc}</p>
                           </div>
                        </li>
                     ))}
                  </ul>
                  <Link to="/catalog" className="inline-block pt-6">
                     <Button variant="primary" className="px-10 py-4 flex items-center gap-3">
                        Launch Mirror Now <ChevronRight size={18} />
                     </Button>
                  </Link>
               </div>
            </div>
         </div>
      </section>

      {/* 3. COLLECTION PREVIEW */}
      <section className="py-24 bg-espresso text-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="flex justify-between items-end mb-12">
              <div>
                 <span className="text-golden-orange uppercase tracking-widest text-xs font-bold">The Edit</span>
                 <h2 className="font-serif text-4xl text-cream mt-2">Curated Collections</h2>
              </div>
              <Link to="/catalog">
                 <Button variant="outline">View All Items</Button>
              </Link>
           </div>
           
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.slice(0, 3).map((product) => (
                <div key={product.id} className="group relative bg-white/5 border border-white/10 overflow-hidden rounded-sm hover:border-golden-orange/30 transition-all duration-500">
                   <div className="relative h-[450px] w-full overflow-hidden">
                      <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute top-4 left-4 bg-golden-orange text-espresso text-[9px] font-black uppercase px-2 py-1 tracking-tighter rounded-sm flex items-center gap-1 shadow-lg">
                         <Sparkles size={10} /> METAVERSE READY
                      </div>
                      <div className="absolute inset-0 bg-espresso/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4 p-8 text-center">
                         <h4 className="font-serif text-2xl text-cream mb-2">{product.name}</h4>
                         <Link to={`/product/${product.id}`} className="w-full">
                            <Button fullWidth variant="primary" className="text-xs">Enter Product View</Button>
                         </Link>
                      </div>
                   </div>
                   <div className="p-6 bg-[#1f0c05]">
                      <div className="flex justify-between items-start">
                         <div>
                            <p className="text-golden-orange text-[10px] uppercase tracking-[0.2em] font-bold mb-1">{product.brand}</p>
                            <h3 className="font-serif text-xl text-cream">{product.name}</h3>
                         </div>
                         <p className="font-serif text-lg text-golden-orange">${product.rentalPrice}</p>
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* RE-USING OTHER SECTIONS (WHY CHOOSE US, ETC) */}
      <section className="py-24 bg-[#1a0a04]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-8 border border-white/5 bg-white/[0.02] text-center group hover:border-golden-orange/20 transition-all">
              <Sparkles className="h-10 w-10 text-golden-orange mx-auto mb-6" />
              <h3 className="font-serif text-xl text-cream mb-4">Curated Excellence</h3>
              <p className="text-cream/60 text-sm font-light">Hand-selected pieces from the world's most prestigious houses.</p>
            </div>
            <div className="p-8 border border-white/5 bg-white/[0.02] text-center group hover:border-golden-orange/20 transition-all">
              <ShieldCheck className="h-10 w-10 text-golden-orange mx-auto mb-6" />
              <h3 className="font-serif text-xl text-cream mb-4">Authenticity</h3>
              <p className="text-cream/60 text-sm font-light">Guaranteed verification by expert authenticators and AI.</p>
            </div>
            <div className="p-8 border border-white/5 bg-white/[0.02] text-center group hover:border-golden-orange/20 transition-all">
              <DollarSign className="h-10 w-10 text-golden-orange mx-auto mb-6" />
              <h3 className="font-serif text-xl text-cream mb-4">Slay Without Pay</h3>
              <p className="text-cream/60 text-sm font-light">Access $5,000 archival couture for a fraction of the cost.</p>
            </div>
            <div className="p-8 border border-white/5 bg-white/[0.02] text-center group hover:border-golden-orange/20 transition-all">
               <Truck className="h-10 w-10 text-golden-orange mx-auto mb-6" />
              <h3 className="font-serif text-xl text-cream mb-4">Premium Logistics</h3>
              <p className="text-cream/60 text-sm font-light">Secure, trackable, and insured delivery to your doorstep.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const Check = ({ className, size }: { className?: string, size?: number }) => (
    <svg viewBox="0 0 24 24" className={className} width={size} height={size} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
);

const ChevronRight = ({ className, size }: { className?: string, size?: number }) => (
    <svg viewBox="0 0 24 24" className={className} width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
);
