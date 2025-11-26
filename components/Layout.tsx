import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, User, Menu, X, Diamond, Check, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const isActive = (path: string) => location.pathname === path ? "text-golden-orange border-b border-golden-orange" : "text-cream hover:text-golden-orange transition-colors";

  const handleSubscribe = () => {
    setIsSubscribed(true);
    setTimeout(() => {
        alert("Welcome to the inner circle.\nYou have been subscribed to the Stylus editorial.");
    }, 100);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-cream bg-espresso selection:bg-golden-orange selection:text-espresso">
      
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-espresso/95 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 group">
              <Diamond className="h-8 w-8 text-golden-orange group-hover:rotate-45 transition-transform duration-500" />
              <span className="font-serif text-3xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-golden-orange to-golden-light">
                STYLUS
              </span>
            </Link>

            {/* Desktop Links */}
            <div className="hidden md:flex space-x-12 items-center">
              <Link to="/" className={`font-serif uppercase tracking-wider text-xs ${isActive('/')}`}>Home</Link>
              <Link to="/catalog" className={`font-serif uppercase tracking-wider text-xs ${isActive('/catalog')}`}>Collection</Link>
              <Link to="/ai-stylist" className={`font-serif uppercase tracking-wider text-xs ${isActive('/ai-stylist')}`}>AI Stylist</Link>
              {isAuthenticated && (
                <Link to="/dashboard" className={`font-serif uppercase tracking-wider text-xs ${isActive('/dashboard')}`}>My Wardrobe</Link>
              )}
            </div>

            {/* Icons */}
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/bag" className="text-cream hover:text-golden-orange transition-colors" title="Shopping Bag">
                <ShoppingBag size={20} />
              </Link>
              {isAuthenticated ? (
                <Link to="/dashboard" className="text-cream hover:text-golden-orange transition-colors" title="My Dashboard">
                  <User size={20} />
                </Link>
              ) : (
                <div className="flex items-center space-x-6">
                  <Link to="/login" className="flex items-center space-x-2 text-cream hover:text-golden-orange transition-colors">
                    <span className="text-xs uppercase tracking-widest font-bold">Sign In</span>
                  </Link>
                  <Link 
                    to="/login" 
                    state={{ mode: 'signup' }}
                    className="flex items-center space-x-2 text-golden-orange border border-golden-orange/50 px-4 py-2 hover:bg-golden-orange hover:text-espresso transition-all"
                  >
                    <span className="text-xs uppercase tracking-widest font-bold">Join</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-cream">
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-espresso border-b border-white/10 animate-fade-in-down">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 text-center">
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-4 font-serif text-golden-orange uppercase tracking-widest hover:bg-white/5">Home</Link>
              <Link to="/catalog" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-4 font-serif text-cream uppercase tracking-widest hover:bg-white/5">Collection</Link>
              <Link to="/ai-stylist" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-4 font-serif text-cream uppercase tracking-widest hover:bg-white/5">AI Stylist</Link>
              <Link to="/bag" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-4 font-serif text-cream uppercase tracking-widest hover:bg-white/5">Shopping Bag</Link>
              {isAuthenticated ? (
                <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-4 font-serif text-cream uppercase tracking-widest hover:bg-white/5">My Wardrobe</Link>
              ) : (
                <>
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-4 font-serif text-cream uppercase tracking-widest hover:bg-white/5">Sign In</Link>
                  <Link to="/login" state={{ mode: 'signup' }} onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-4 font-serif text-golden-orange uppercase tracking-widest hover:bg-white/5 font-bold">Join Stylus</Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-grow pt-20">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-[#1a0a04] border-t border-white/5 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-1">
               <span className="font-serif text-2xl font-bold tracking-widest text-golden-orange block mb-4">
                STYLUS
              </span>
              <p className="text-cream/60 text-sm leading-relaxed">
                Wear royalty without cost. The world's most exclusive fashion rental ecosystem.
              </p>
            </div>
            <div>
              <h4 className="font-serif text-golden-light uppercase tracking-widest mb-6 text-sm">Explore</h4>
              <ul className="space-y-3 text-sm text-cream/70">
                <li><Link to="/catalog" className="hover:text-golden-orange transition-colors">Collection</Link></li>
                <li><Link to="/ai-stylist" className="hover:text-golden-orange transition-colors">Concierge</Link></li>
                <li><Link to="/the-edit" className="hover:text-golden-orange transition-colors">The Edit</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-serif text-golden-light uppercase tracking-widest mb-6 text-sm">Legal</h4>
              <ul className="space-y-3 text-sm text-cream/70">
                <li><Link to="/privacy" className="hover:text-golden-orange transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-golden-orange transition-colors">Terms of Service</Link></li>
                <li><Link to="/authenticity" className="hover:text-golden-orange transition-colors">Authenticity Guarantee</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-serif text-golden-light uppercase tracking-widest mb-6 text-sm">Stay in Vogue</h4>
              <div className="flex">
                {isSubscribed ? (
                   <div className="w-full bg-golden-orange text-espresso px-4 py-2 text-sm font-bold uppercase tracking-wider flex items-center justify-center">
                      <Check size={16} className="mr-2" /> Subscribed
                   </div>
                ) : (
                  <>
                    <input 
                      type="email" 
                      placeholder="Your email address" 
                      className="bg-white/5 border border-white/10 px-4 py-2 text-sm text-cream focus:outline-none focus:border-golden-orange flex-grow w-full"
                    />
                    <button 
                      onClick={handleSubscribe}
                      className="bg-golden-orange text-espresso px-4 py-2 text-sm font-bold uppercase tracking-wider hover:bg-white hover:text-espresso transition-colors"
                    >
                      Join
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="mt-16 border-t border-white/5 pt-8 text-center text-xs text-cream/40 uppercase tracking-widest">
            &copy; 2024 Stylus Luxury Rentals. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};