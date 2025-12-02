import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MOCK_USER } from '../constants';
import { Package, Calendar, CreditCard, Settings, LogOut, Diamond, Plus, Upload, Tag, Clock, X, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProduct } from '../context/ProductContext';
import { Category, Product } from '../types';
import { Button } from '../components/Button';

// Countdown Timer Component
const RentalCountdown: React.FC<{ dueDate: string }> = ({ dueDate }) => {
    const [timeLeft, setTimeLeft] = useState<{days: number, hours: number, minutes: number} | null>(null);

    useEffect(() => {
        const calculateTime = () => {
            const now = new Date().getTime();
            // Handle various date formats by ensuring a standard constructor works
            const due = new Date(dueDate);
            // Set to end of day (11:59:59 PM)
            due.setHours(23, 59, 59);
            
            const difference = due.getTime() - now;

            if (difference > 0) {
                const days = Math.floor(difference / (1000 * 60 * 60 * 24));
                const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
                setTimeLeft({ days, hours, minutes });
            } else {
                setTimeLeft(null); // Overdue
            }
        };

        calculateTime();
        const timer = setInterval(calculateTime, 60000); // Update every minute
        return () => clearInterval(timer);
    }, [dueDate]);

    if (!timeLeft) return <div className="text-red-500 font-bold uppercase tracking-widest text-xs flex items-center mt-2"><Clock size={12} className="mr-1" /> Return Overdue</div>;

    return (
        <div className="flex items-center space-x-3 bg-golden-orange/5 px-4 py-2 rounded border border-golden-orange/20 mt-3 max-w-max">
             <Clock size={14} className="text-golden-orange" />
             <div className="flex items-baseline space-x-1">
                <span className="font-serif text-lg text-golden-orange font-bold leading-none">{timeLeft.days}</span>
                <span className="text-[10px] text-cream/50 uppercase mr-1">Days</span>
                
                <span className="font-serif text-lg text-golden-orange font-bold leading-none">{timeLeft.hours}</span>
                <span className="text-[10px] text-cream/50 uppercase mr-1">Hr</span>

                <span className="font-serif text-lg text-golden-orange font-bold leading-none">{timeLeft.minutes}</span>
                <span className="text-[10px] text-cream/50 uppercase">Min</span>
            </div>
            <span className="text-[10px] text-cream/40 uppercase tracking-widest ml-1 border-l border-white/10 pl-2">Remaining</span>
        </div>
    );
};

interface ActiveRental {
  id: string;
  product: Product;
  dueDate: string;
  tracking: string;
  status: string;
  statusColor: string;
}

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const { products, addProduct } = useProduct();
  const [currentView, setCurrentView] = useState<'overview' | 'list-item'>('overview');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  // Extension State
  const [extendingRental, setExtendingRental] = useState<ActiveRental | null>(null);
  const [extensionDays, setExtensionDays] = useState<4 | 8>(4);
  const [extendedDueDates, setExtendedDueDates] = useState<Record<string, string>>({}); // Track extensions locally

  const newRental = location.state?.newRental;

  // Use the logged-in user's name if available, otherwise fallback to Mock
  const displayName = user?.name || MOCK_USER.name;

  // Create dynamic dates for mock rentals so the countdown always looks good
  const today = new Date();
  const dateIn3Days = new Date(today); dateIn3Days.setDate(today.getDate() + 3);
  const dateIn5Days = new Date(today); dateIn5Days.setDate(today.getDate() + 5);

  const formatDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  // Combine dynamic new rental with mock active rentals for display
  const activeRentals: ActiveRental[] = [
    ...(newRental ? [{
      id: 'new-rental',
      product: newRental.product as Product,
      dueDate: newRental.returnDate,
      tracking: 'Processing',
      status: 'New Rental',
      statusColor: 'text-golden-orange border-golden-orange bg-golden-orange/10'
    }] : []),
    ...products.slice(0, 1).map((p, idx) => ({
      id: `existing-1`,
      product: p,
      dueDate: formatDate(dateIn3Days),
      tracking: '#STY-8829',
      status: 'Active',
      statusColor: 'text-green-400 border-green-900 bg-green-900/30'
    })),
     ...products.slice(3, 4).map((p, idx) => ({
      id: `existing-2`,
      product: p,
      dueDate: formatDate(dateIn5Days),
      tracking: '#STY-9941',
      status: 'Active',
      statusColor: 'text-green-400 border-green-900 bg-green-900/30'
    }))
  ];

  // Apply overrides if any rentals have been extended
  const displayRentals = activeRentals.map(rental => ({
      ...rental,
      dueDate: extendedDueDates[rental.id] || rental.dueDate
  }));

  // Form State
  const [newItem, setNewItem] = useState<Partial<Product>>({
    name: '',
    brand: '',
    category: Category.WOMEN,
    rentalPrice: 0,
    retailPrice: 0,
    description: '',
    availableSizes: [],
    images: [], // Changed to array
    color: '',
    occasion: ''
  });
  const [sizeInput, setSizeInput] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleSidebarClick = (feature: string) => {
    if (feature === 'Sign Out') {
      setShowLogoutConfirm(true);
    } else if (feature === 'List Item') {
      setCurrentView('list-item');
    } else if (feature === 'My Orders') {
      setCurrentView('overview');
    } else {
      alert(`Stylus Demo: The '${feature}' feature is available in the full production release.`);
    }
  };

  const performLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAction = (action: string, rental: ActiveRental) => {
    if (action === 'Extend') {
        setExtendingRental(rental);
        setExtensionDays(4); // Reset to default
    } else {
        alert(`Request received: ${action} for ${rental.product.name}.\nA concierge will contact you shortly to coordinate.`);
    }
  };

  const confirmExtension = () => {
      if (!extendingRental) return;

      const currentDueDate = new Date(extendedDueDates[extendingRental.id] || extendingRental.dueDate);
      const newDueDate = new Date(currentDueDate);
      newDueDate.setDate(newDueDate.getDate() + extensionDays);
      
      const newDateString = newDueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

      setExtendedDueDates(prev => ({
          ...prev,
          [extendingRental.id]: newDateString
      }));

      // In a real app, we would charge the card here
      setExtendingRental(null);
      alert("Extension confirmed. Your return date has been updated.");
  };

  const getExtensionCost = (days: number, basePrice: number) => {
      // 50% of base price for 4 days, 90% for 8 days
      if (days === 4) return Math.round(basePrice * 0.5);
      return Math.round(basePrice * 0.9);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      // Create a fake local URL for demo purposes
      setNewItem({ ...newItem, images: [URL.createObjectURL(file)] });
    }
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || !newItem.brand || !newItem.rentalPrice) {
        alert("Please fill in all required fields.");
        return;
    }

    const product: Product = {
        id: Math.random().toString(36).substr(2, 9),
        name: newItem.name!,
        brand: newItem.brand!,
        category: newItem.category as Category,
        rentalPrice: Number(newItem.rentalPrice),
        retailPrice: Number(newItem.retailPrice),
        description: newItem.description || '',
        images: newItem.images && newItem.images.length > 0 
          ? newItem.images 
          : ['https://images.unsplash.com/photo-1549439602-43ebca2327af?q=80&w=1000&auto=format&fit=crop'],
        availableSizes: sizeInput.split(',').map(s => s.trim()).filter(s => s),
        color: newItem.color || 'Multi',
        occasion: newItem.occasion || 'General',
        reviews: []
    };

    addProduct(product);
    alert("Item listed successfully! It is now available in the collection.");
    setCurrentView('overview');
    // Reset form
    setNewItem({ name: '', brand: '', category: Category.WOMEN, rentalPrice: 0, retailPrice: 0, description: '', availableSizes: [], images: [], color: '', occasion: '' });
    setSizeInput('');
    setImageFile(null);
  };

  return (
    <div className="min-h-screen bg-espresso pb-20 animate-fade-in">
      
      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setShowLogoutConfirm(false)}>
            <div className="bg-[#1f0c05] border border-golden-orange w-full max-w-md p-8 text-center relative shadow-[0_0_50px_rgba(0,0,0,0.8)]" onClick={e => e.stopPropagation()}>
                <Diamond size={32} className="mx-auto text-golden-orange mb-4" />
                <h2 className="font-serif text-2xl text-cream mb-2">Sign Out</h2>
                <p className="text-cream/60 mb-8 font-light text-sm leading-relaxed">Are you sure you wish to depart from the Stylus inner circle?</p>
                <div className="flex gap-4 justify-center">
                    <Button variant="outline" onClick={() => setShowLogoutConfirm(false)} className="w-32">Cancel</Button>
                    <Button onClick={performLogout} className="w-32">Confirm</Button>
                </div>
            </div>
        </div>
      )}

      {/* Extend Rental Modal */}
      {extendingRental && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setExtendingRental(null)}>
              <div className="bg-[#1f0c05] border border-golden-orange w-full max-w-lg relative shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col" onClick={e => e.stopPropagation()}>
                  
                  {/* Modal Header */}
                  <div className="flex justify-between items-start p-6 border-b border-white/10 bg-white/5">
                      <div>
                          <p className="text-xs text-golden-orange uppercase tracking-widest mb-1">Modify Rental</p>
                          <h2 className="font-serif text-2xl text-cream">Extend Your Style</h2>
                      </div>
                      <button onClick={() => setExtendingRental(null)} className="text-cream/50 hover:text-golden-orange transition-colors">
                          <X size={24} />
                      </button>
                  </div>

                  {/* Modal Body */}
                  <div className="p-6">
                      <div className="flex items-center gap-4 mb-6">
                          <img src={extendingRental.product.images[0]} alt="Product" className="w-16 h-20 object-cover border border-white/10" />
                          <div>
                              <p className="text-sm font-bold text-cream">{extendingRental.product.name}</p>
                              <p className="text-xs text-cream/50">Current Due Date: <span className="text-golden-orange">{extendedDueDates[extendingRental.id] || extendingRental.dueDate}</span></p>
                          </div>
                      </div>

                      <h3 className="text-xs text-cream/60 uppercase tracking-widest mb-4">Select Extension Duration</h3>
                      
                      <div className="grid grid-cols-2 gap-4 mb-8">
                          {[4, 8].map((days) => {
                              const cost = getExtensionCost(days, extendingRental.product.rentalPrice);
                              const isSelected = extensionDays === days;
                              return (
                                  <button
                                      key={days}
                                      onClick={() => setExtensionDays(days as 4 | 8)}
                                      className={`p-4 border text-center transition-all duration-300 relative group ${
                                          isSelected 
                                          ? 'bg-golden-orange/10 border-golden-orange' 
                                          : 'bg-white/5 border-white/10 hover:border-golden-orange/50'
                                      }`}
                                  >
                                      {isSelected && <div className="absolute top-2 right-2 text-golden-orange"><Check size={14} /></div>}
                                      <p className="font-serif text-lg text-cream mb-1">+{days} Days</p>
                                      <p className={`text-sm ${isSelected ? 'text-golden-orange font-bold' : 'text-cream/50'}`}>${cost}</p>
                                  </button>
                              );
                          })}
                      </div>

                      <div className="bg-white/5 p-4 rounded mb-6">
                          <div className="flex justify-between mb-2">
                              <span className="text-sm text-cream/70">Extension Fee</span>
                              <span className="text-sm text-cream">${getExtensionCost(extensionDays, extendingRental.product.rentalPrice)}</span>
                          </div>
                          <div className="flex justify-between pt-2 border-t border-white/10">
                              <span className="text-sm font-bold text-golden-orange uppercase tracking-wide">Total Charge</span>
                              <span className="text-lg font-serif text-golden-orange">${getExtensionCost(extensionDays, extendingRental.product.rentalPrice)}</span>
                          </div>
                      </div>

                      <div className="flex gap-4">
                          <Button variant="outline" fullWidth onClick={() => setExtendingRental(null)}>Cancel</Button>
                          <Button fullWidth onClick={confirmExtension}>Confirm & Pay</Button>
                      </div>
                  </div>
              </div>
          </div>
      )}

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
                  {displayName.charAt(0)}
                </div>
                <h2 className="font-serif text-2xl text-cream mb-1">{displayName}</h2>
                <p className="text-golden-orange text-sm uppercase tracking-widest mb-6">{MOCK_USER.subscriptionTier} Member</p>
                
                <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-6">
                  <div className="text-center">
                    <p className="text-2xl text-white font-bold">{displayRentals.length}</p>
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
              <button onClick={() => handleSidebarClick('My Orders')} className={`w-full flex items-center space-x-3 px-6 py-4 border border-transparent transition-all group ${currentView === 'overview' ? 'bg-golden-orange text-espresso font-bold' : 'bg-white/5 text-cream hover:border-golden-orange/50'}`}>
                <Package size={20} className={`${currentView === 'overview' ? 'text-espresso' : 'text-golden-orange'} group-hover:scale-110 transition-transform`} />
                <span className="font-serif tracking-wide">My Orders</span>
              </button>
               <button onClick={() => handleSidebarClick('List Item')} className={`w-full flex items-center space-x-3 px-6 py-4 border border-transparent transition-all group ${currentView === 'list-item' ? 'bg-golden-orange text-espresso font-bold' : 'bg-white/5 text-cream hover:border-golden-orange/50'}`}>
                <Plus size={20} className={`${currentView === 'list-item' ? 'text-espresso' : 'text-golden-orange'} group-hover:scale-110 transition-transform`} />
                <span className="font-serif tracking-wide">List New Item</span>
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
            
            {currentView === 'overview' ? (
              <>
                <h3 className="font-serif text-2xl text-cream mb-6 border-l-4 border-golden-orange pl-4">Active Rentals</h3>
                
                <div className="space-y-6">
                  {displayRentals.map((rental) => (
                    <div key={rental.id} className="bg-white/5 border border-white/5 p-6 flex flex-col sm:flex-row gap-6 hover:border-golden-orange/30 transition-colors group">
                      <div className="w-full sm:w-32 h-40 bg-black/20 flex-shrink-0 relative overflow-hidden">
                        <img src={rental.product.images[0]} alt={rental.product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="text-xs text-golden-orange uppercase tracking-wide">{rental.product.brand}</p>
                            <h4 className="font-serif text-xl text-cream">{rental.product.name}</h4>
                          </div>
                          <span className={`text-xs px-2 py-1 uppercase tracking-wide border ${rental.statusColor}`}>
                            {rental.status}
                          </span>
                        </div>
                        
                        <div className="flex items-center text-sm text-cream/60 mt-4 space-x-6">
                          <div className="flex items-center">
                            <Calendar size={16} className="mr-2 text-golden-orange" />
                            <span>Due: {rental.dueDate}</span>
                          </div>
                          <div className="flex items-center">
                            <Package size={16} className="mr-2 text-golden-orange" />
                            <span>Tracking: {rental.tracking}</span>
                          </div>
                        </div>

                        {/* Countdown Timer */}
                        <RentalCountdown dueDate={rental.dueDate} />

                        <div className="mt-6 flex space-x-4">
                          <button 
                            onClick={() => handleAction('Return', rental)}
                            className="text-xs uppercase font-bold text-cream hover:text-golden-orange transition-colors border-b border-transparent hover:border-golden-orange pb-1"
                          >
                            Return Item
                          </button>
                          <button 
                            onClick={() => handleAction('Extend', rental)}
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
                    <p className="text-cream/70 mb-6 italic">Based on your rental history, our AI stylist suggests:</p>
                    
                    {products.length > 2 && (
                        <div className="flex flex-col items-center">
                          <div className="w-48 h-64 overflow-hidden mb-4 border border-golden-orange/20 shadow-lg">
                            <img src={products[2].images[0]} alt="Suggestion" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                          </div>
                          <p className="text-golden-orange text-xs uppercase tracking-widest mb-1">{products[2].brand}</p>
                          <p className="font-serif text-xl text-cream mb-4">{products[2].name}</p>
                          <button onClick={() => navigate(`/product/${products[2].id}`)} className="text-sm border border-cream/30 px-6 py-2 hover:bg-golden-orange hover:text-espresso hover:border-golden-orange transition-all uppercase tracking-widest">
                            View Details
                          </button>
                        </div>
                    )}
                 </div>
              </>
            ) : (
              <div className="animate-fade-in">
                 <h3 className="font-serif text-2xl text-cream mb-6 border-l-4 border-golden-orange pl-4">List New Item</h3>
                 <div className="bg-white/5 border border-white/10 p-8 rounded-sm">
                    <form onSubmit={handleAddItem} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs uppercase tracking-widest text-cream/60 mb-2">Item Name</label>
                                <input 
                                    type="text" 
                                    required
                                    value={newItem.name}
                                    onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                                    className="w-full bg-black/20 border border-white/10 text-cream px-4 py-3 focus:outline-none focus:border-golden-orange transition-colors"
                                    placeholder="e.g. Vintage Silk Gown"
                                />
                            </div>
                            <div>
                                <label className="block text-xs uppercase tracking-widest text-cream/60 mb-2">Brand / Designer</label>
                                <input 
                                    type="text" 
                                    required
                                    value={newItem.brand}
                                    onChange={(e) => setNewItem({...newItem, brand: e.target.value})}
                                    className="w-full bg-black/20 border border-white/10 text-cream px-4 py-3 focus:outline-none focus:border-golden-orange transition-colors"
                                    placeholder="e.g. Dior"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-xs uppercase tracking-widest text-cream/60 mb-2">Category</label>
                                <select 
                                    value={newItem.category}
                                    onChange={(e) => setNewItem({...newItem, category: e.target.value as Category})}
                                    className="w-full bg-black/20 border border-white/10 text-cream px-4 py-3 focus:outline-none focus:border-golden-orange transition-colors"
                                >
                                    {Object.values(Category).map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs uppercase tracking-widest text-cream/60 mb-2">Color</label>
                                <input 
                                    type="text" 
                                    value={newItem.color}
                                    onChange={(e) => setNewItem({...newItem, color: e.target.value})}
                                    className="w-full bg-black/20 border border-white/10 text-cream px-4 py-3 focus:outline-none focus:border-golden-orange transition-colors"
                                    placeholder="e.g. Black"
                                />
                            </div>
                            <div>
                                <label className="block text-xs uppercase tracking-widest text-cream/60 mb-2">Occasion</label>
                                <input 
                                    type="text" 
                                    value={newItem.occasion}
                                    onChange={(e) => setNewItem({...newItem, occasion: e.target.value})}
                                    className="w-full bg-black/20 border border-white/10 text-cream px-4 py-3 focus:outline-none focus:border-golden-orange transition-colors"
                                    placeholder="e.g. Gala"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs uppercase tracking-widest text-cream/60 mb-2">Rental Price ($)</label>
                                <input 
                                    type="number" 
                                    required
                                    value={newItem.rentalPrice}
                                    onChange={(e) => setNewItem({...newItem, rentalPrice: Number(e.target.value)})}
                                    className="w-full bg-black/20 border border-white/10 text-cream px-4 py-3 focus:outline-none focus:border-golden-orange transition-colors"
                                />
                            </div>
                             <div>
                                <label className="block text-xs uppercase tracking-widest text-cream/60 mb-2">Retail Price ($)</label>
                                <input 
                                    type="number" 
                                    required
                                    value={newItem.retailPrice}
                                    onChange={(e) => setNewItem({...newItem, retailPrice: Number(e.target.value)})}
                                    className="w-full bg-black/20 border border-white/10 text-cream px-4 py-3 focus:outline-none focus:border-golden-orange transition-colors"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs uppercase tracking-widest text-cream/60 mb-2">Available Sizes (Comma Separated)</label>
                             <input 
                                    type="text" 
                                    value={sizeInput}
                                    onChange={(e) => setSizeInput(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 text-cream px-4 py-3 focus:outline-none focus:border-golden-orange transition-colors"
                                    placeholder="e.g. S, M, L"
                                />
                        </div>

                         <div>
                            <label className="block text-xs uppercase tracking-widest text-cream/60 mb-2">Description</label>
                            <textarea 
                                rows={4}
                                value={newItem.description}
                                onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                                className="w-full bg-black/20 border border-white/10 text-cream px-4 py-3 focus:outline-none focus:border-golden-orange transition-colors"
                                placeholder="Describe the item's condition, material, and fit..."
                            />
                        </div>

                        <div>
                            <label className="block text-xs uppercase tracking-widest text-cream/60 mb-2">Upload Image</label>
                            <div className="relative border-2 border-dashed border-white/10 bg-black/20 p-8 text-center hover:border-golden-orange transition-colors cursor-pointer group">
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                {newItem.images && newItem.images.length > 0 ? (
                                    <div className="flex flex-col items-center">
                                        <img src={newItem.images[0]} alt="Preview" className="h-32 object-contain mb-2" />
                                        <span className="text-xs text-green-400">Image Loaded</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center text-cream/50 group-hover:text-golden-orange">
                                        <Upload className="mb-2" />
                                        <span className="text-xs uppercase tracking-wide">Click to upload photo</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="pt-4">
                            <Button fullWidth type="submit">List Item</Button>
                        </div>

                    </form>
                 </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};