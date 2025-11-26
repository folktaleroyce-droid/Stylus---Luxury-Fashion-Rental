import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_USER, MOCK_PRODUCTS } from '../constants';
import { Package, Calendar, CreditCard, Settings, LogOut, Diamond, ArrowRight } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const handleSidebarClick = (feature: string) => {
    if (feature === 'Sign Out') {
      const confirm = window.confirm("Are you sure you wish to sign out?");
      if (confirm) navigate('/');
    } else {
      alert(`Stylus Demo: The '${feature}' feature is available in the full production release.`);
    }
  };

  const handleAction = (action: string, item: string) => {
    alert(`Request received: ${action} for ${item}.\nA concierge will contact you shortly to coordinate.`);
  };

  return (
    <div className="min-h-screen bg-espresso pb-20 animate-fade-in">
      {/* Header Pattern */}
      <div className="h-48 bg-[#1a0a04] border-b border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#e1af4d 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar / Profile Card */}
          <div className="w-full md:w-1/3">
            <div className="bg-[#1f0c05] border border-golden-orange/20 p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Diamond size={100} className="text-golden-orange" />
              </div>
              
              <div className="relative z-10 text-center">
                <div className="w-24 h-24 bg-golden-orange rounded-full mx-auto mb-4 flex items-center justify-center text-espresso text-3xl font-serif font-bold border-4 border-[#1f0c05] shadow-lg">
                  {MOCK_USER.name.charAt(0)}
                </div>
                <h2 className="font-serif text-2xl text-cream mb-1">{MOCK_USER.name}</h2>
                <p className="text-golden-orange text-sm uppercase tracking-widest mb-6">{MOCK_USER.subscriptionTier} Member</p>
                
                <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-6">
                  <div className="text-center">
                    <p className="text-2xl text-white font-bold">{MOCK_USER.activeRentals}</p>
                    <p className="text-xs text-white/40 uppercase">Active Rentals</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl text-white font-bold">12</p>
                    <p className="text-xs text-white/40 uppercase">Past Looks</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <button onClick={() => handleSidebarClick('My Orders')} className="w-full flex items-center space-x-3 px-6 py-4 bg-white/5 border border-transparent hover:border-golden-orange/50 text-cream transition-all group">
                <Package size={20} className="text-golden-orange group-hover:scale-110 transition-transform" />
                <span className="font-serif tracking-wide">My Orders</span>
              </button>
              <button onClick={() => handleSidebarClick('Payment Methods')} className="w-full flex items-center space-x-3 px-6 py-4 bg-white/5 border border-transparent hover:border-golden-orange/50 text-cream transition-all group">
                <CreditCard size={20} className="text-golden-orange group-hover:scale-110 transition-transform" />
                <span className="font-serif tracking-wide">Payment Methods</span>
              </button>
              <button onClick={() => handleSidebarClick('Settings')} className="w-full flex items-center space-x-3 px-6 py-4 bg-white/5 border border-transparent hover:border-golden-orange/50 text-cream transition-all group">
                <Settings size={20} className="text-golden-orange group-hover:scale-110 transition-transform" />
                <span className="font-serif tracking-wide">Settings</span>
              </button>
              <button onClick={() => handleSidebarClick('Sign Out')} className="w-full flex items-center space-x-3 px-6 py-4 bg-white/5 border border-transparent hover:border-red-500/50 text-cream hover:text-red-400 transition-all group">
                <LogOut size={20} className="group-hover:scale-110 transition-transform" />
                <span className="font-serif tracking-wide">Sign Out</span>
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="w-full md:w-2/3">
            <h3 className="font-serif text-2xl text-cream mb-6 border-l-4 border-golden-orange pl-4">Active Rentals</h3>
            
            <div className="space-y-6">
              {MOCK_PRODUCTS.slice(0, 2).map((product, idx) => (
                <div key={idx} className="bg-white/5 border border-white/5 p-6 flex flex-col sm:flex-row gap-6 hover:border-golden-orange/30 transition-colors group">
                  <div className="w-full sm:w-32 h-40 bg-black/20 flex-shrink-0 relative overflow-hidden">
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-xs text-golden-orange uppercase tracking-wide">{product.brand}</p>
                        <h4 className="font-serif text-xl text-cream">{product.name}</h4>
                      </div>
                      <span className="bg-green-900/30 text-green-400 text-xs px-2 py-1 uppercase tracking-wide border border-green-900">Active</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-cream/60 mt-4 space-x-6">
                      <div className="flex items-center">
                        <Calendar size={16} className="mr-2 text-golden-orange" />
                        <span>Due: Oct 24, 2024</span>
                      </div>
                      <div className="flex items-center">
                        <Package size={16} className="mr-2 text-golden-orange" />
                        <span>Tracking: #STY-8829</span>
                      </div>
                    </div>

                    <div className="mt-6 flex space-x-4">
                      <button 
                        onClick={() => handleAction('Return', product.name)}
                        className="text-xs uppercase font-bold text-cream hover:text-golden-orange transition-colors border-b border-transparent hover:border-golden-orange pb-1"
                      >
                        Return Item
                      </button>
                      <button 
                        onClick={() => handleAction('Extend', product.name)}
                        className="text-xs uppercase font-bold text-cream hover:text-golden-orange transition-colors border-b border-transparent hover:border-golden-orange pb-1"
                      >
                        Extend Rental
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <h3 className="font-serif text-2xl text-cream mb-6 mt-12 border-l-4 border-golden-orange pl-4">Recommended For You</h3>
             <div className="bg-[#1f0c05] p-8 border border-white/10 text-center relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-golden-orange/5 rounded-full blur-2xl -mr-16 -mt-16"></div>
                <p className="text-cream/70 mb-6 italic">Based on your rental of the <strong>Midnight Velvet Evening Gown</strong>, our AI stylist suggests:</p>
                
                <div className="flex flex-col items-center">
                  <div className="w-48 h-64 overflow-hidden mb-4 border border-golden-orange/20 shadow-lg">
                    <img src={MOCK_PRODUCTS[2].imageUrl} alt="Suggestion" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  </div>
                  <p className="text-golden-orange text-xs uppercase tracking-widest mb-1">{MOCK_PRODUCTS[2].brand}</p>
                  <p className="font-serif text-xl text-cream mb-4">{MOCK_PRODUCTS[2].name}</p>
                  <button onClick={() => navigate(`/product/${MOCK_PRODUCTS[2].id}`)} className="text-sm border border-cream/30 px-6 py-2 hover:bg-golden-orange hover:text-espresso hover:border-golden-orange transition-all uppercase tracking-widest">
                    View Details
                  </button>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};