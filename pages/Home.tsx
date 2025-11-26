import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { ArrowRight, ShieldCheck, Truck, Sparkles, Diamond } from 'lucide-react';

export const Home: React.FC = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [animationStep, setAnimationStep] = useState(0);

  useEffect(() => {
    // Sequence the animation steps
    const step1 = setTimeout(() => setAnimationStep(1), 500); // Logo Fade In
    const step2 = setTimeout(() => setAnimationStep(2), 1500); // Text Reveal
    const step3 = setTimeout(() => setAnimationStep(3), 3000); // Exit trigger
    const step4 = setTimeout(() => setShowIntro(false), 4000); // Remove from DOM

    return () => {
      clearTimeout(step1);
      clearTimeout(step2);
      clearTimeout(step3);
      clearTimeout(step4);
    };
  }, []);

  return (
    <div className="animate-fade-in relative">
      
      {/* CINEMATIC INTRO OVERLAY */}
      {showIntro && (
        <div 
          className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#1a0a04] transition-all duration-1000 ease-in-out ${
            animationStep >= 3 ? 'opacity-0 -translate-y-full' : 'opacity-100'
          }`}
        >
          {/* Animated Diamond */}
          <div className={`transition-all duration-1000 transform ${animationStep >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
            <Diamond size={64} className="text-golden-orange animate-pulse" />
          </div>

          {/* Text Reveal */}
          <div className={`mt-6 text-center transition-all duration-1000 ${animationStep >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h1 className="font-serif text-5xl md:text-7xl font-bold tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-golden-orange via-golden-light to-golden-orange">
              STYLUS
            </h1>
            <p className="mt-4 text-cream/60 uppercase tracking-[0.4em] text-xs md:text-sm font-light">
              Wear Royalty Without Cost
            </p>
          </div>

          {/* Loading Line */}
          <div className="absolute bottom-20 w-64 h-0.5 bg-white/10 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-golden-orange transition-all duration-[3000ms] ease-out ${
                animationStep >= 1 ? 'w-full' : 'w-0'
              }`}
            />
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop" 
            alt="Luxury Fashion" 
            className="w-full h-full object-cover opacity-60 animate-ken-burns" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-espresso via-espresso/40 to-transparent"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center max-w-4xl px-4">
          <p className="text-golden-orange font-serif tracking-[0.3em] uppercase mb-4 animate-slide-up">The New Standard of Luxury</p>
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-cream mb-8 leading-tight animate-slide-up delay-100">
            Wear Royalty <br/> Without Cost
          </h1>
          <p className="text-cream/80 text-lg md:text-xl font-light mb-12 max-w-2xl mx-auto animate-slide-up delay-200">
            Access the world's most exclusive wardrobes. From runway to reality, experience fashion without the commitment.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center animate-slide-up delay-300">
            <Link to="/catalog">
              <Button variant="primary">Explore Collection</Button>
            </Link>
            <Link to="/ai-stylist">
              <Button variant="outline">Consult AI Stylist</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-24 bg-espresso relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="p-8 border border-golden-orange/10 hover:border-golden-orange/30 transition-all duration-500 hover:-translate-y-2 bg-white/[0.02]">
              <div className="flex justify-center mb-6">
                <Sparkles className="h-10 w-10 text-golden-orange" />
              </div>
              <h3 className="font-serif text-2xl text-cream mb-4">Curated Excellence</h3>
              <p className="text-cream/60 font-light">Hand-selected pieces from the world's most prestigious fashion houses.</p>
            </div>
            <div className="p-8 border border-golden-orange/10 hover:border-golden-orange/30 transition-all duration-500 hover:-translate-y-2 bg-white/[0.02]">
              <div className="flex justify-center mb-6">
                <ShieldCheck className="h-10 w-10 text-golden-orange" />
              </div>
              <h3 className="font-serif text-2xl text-cream mb-4">Authenticity Guaranteed</h3>
              <p className="text-cream/60 font-light">Every item is verified by expert authenticators using advanced AI technology.</p>
            </div>
            <div className="p-8 border border-golden-orange/10 hover:border-golden-orange/30 transition-all duration-500 hover:-translate-y-2 bg-white/[0.02]">
              <div className="flex justify-center mb-6">
                <Truck className="h-10 w-10 text-golden-orange" />
              </div>
              <h3 className="font-serif text-2xl text-cream mb-4">White Glove Service</h3>
              <p className="text-cream/60 font-light">Same-day delivery in major cities. Cleaned, pressed, and ready to wear.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Teaser */}
      <section className="py-24 bg-cream text-espresso">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-golden-orange font-bold tracking-widest uppercase mb-2 block">The Collection</span>
              <h2 className="font-serif text-5xl mb-6">Slay Without Pay</h2>
              <p className="text-espresso/70 text-lg mb-8 leading-relaxed">
                Why own when you can experience? Stylus offers a rotating wardrobe of high-end fashion, allowing you to constantly evolve your style without the burden of ownership.
              </p>
              <Link to="/catalog">
                <button className="group flex items-center space-x-2 text-espresso font-bold uppercase tracking-widest border-b-2 border-espresso pb-1 hover:text-golden-orange hover:border-golden-orange transition-colors">
                  <span>View All Arrivals</span>
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
                </button>
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <img src="https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=1000&auto=format&fit=crop" className="w-full h-80 object-cover" alt="Fashion 1" />
              <img src="https://images.unsplash.com/photo-1549439602-43ebca2327af?q=80&w=1000&auto=format&fit=crop" className="w-full h-80 object-cover mt-8" alt="Fashion 2" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};