import React from 'react';
import { Diamond, Clock, Globe } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-espresso animate-fade-in">
       {/* Header */}
       <div className="relative h-[60vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
             <img src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=2074&auto=format&fit=crop" alt="About Stylus" className="w-full h-full object-cover opacity-40" />
             <div className="absolute inset-0 bg-gradient-to-t from-espresso via-transparent to-espresso/50"></div>
          </div>
          <div className="relative z-10 text-center max-w-4xl px-4">
             <span className="text-golden-orange uppercase tracking-[0.3em] text-sm">Our Story</span>
             <h1 className="font-serif text-5xl md:text-7xl text-cream mt-4">Redefining Ownership</h1>
          </div>
       </div>

       <div className="max-w-4xl mx-auto px-6 py-24 text-center">
           <Diamond className="w-12 h-12 text-golden-orange mx-auto mb-8" />
           <p className="text-2xl font-serif text-cream leading-relaxed mb-12">
             "Stylus was born from a simple yet radical idea: that true luxury lies in the experience, not the possession."
           </p>
           <p className="text-cream/70 leading-relaxed mb-8">
             Founded in 2023, Stylus bridges the gap between the runway and your reality. We have curated a vault of the world's most coveted garments, making them accessible to a community of fashion-forward individuals who value variety, sustainability, and excellence.
           </p>
       </div>

       <div className="bg-[#1f0c05] py-24 border-y border-white/5">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
             <div>
                <Clock className="w-10 h-10 text-golden-orange mx-auto mb-6" />
                <h3 className="font-serif text-xl text-cream mb-4">Timeless Style</h3>
                <p className="text-cream/60 text-sm">We don't just chase trends; we curate icons. Our collection spans decades of design excellence.</p>
             </div>
             <div>
                <Globe className="w-10 h-10 text-golden-orange mx-auto mb-6" />
                <h3 className="font-serif text-xl text-cream mb-4">Global Sourcing</h3>
                <p className="text-cream/60 text-sm">From Milan to Paris, our buyers scout the globe to bring you exclusive pieces unavailable elsewhere.</p>
             </div>
             <div>
                <Diamond className="w-10 h-10 text-golden-orange mx-auto mb-6" />
                <h3 className="font-serif text-xl text-cream mb-4">Sustainable Luxury</h3>
                <p className="text-cream/60 text-sm">Extending the lifecycle of luxury garments reduces waste and promotes a circular fashion economy.</p>
             </div>
          </div>
       </div>
    </div>
  );
};