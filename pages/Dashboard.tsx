import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_USER } from '../constants';
import { Package, Calendar, CreditCard, Settings, LogOut, Diamond, Plus, Upload, Tag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProduct } from '../context/ProductContext';
import { Category, Product } from '../types';
import { Button } from '../components/Button';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { products, addProduct } = useProduct();
  const [currentView, setCurrentView] = useState<'overview' | 'list-item'>('overview');

  // Use the logged-in user's name if available, otherwise fallback to Mock
  const displayName = user?.name || MOCK_USER.name;

  // Form State
  const [newItem, setNewItem] = useState<Partial<Product>>({
    name: '',
    brand: '',
    category: Category.WOMEN,
    rentalPrice: 0,
    retailPrice: 0,
    description: '',
    availableSizes: [],
    imageUrl: ''
  });
  const [sizeInput, setSizeInput] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleSidebarClick = (feature: string) => {
    if (feature === 'Sign Out') {
      const confirm = window.confirm("Are you sure you wish to sign out?");
      if (confirm) {
        logout();
        navigate('/login');
      }
    } else if (feature === 'List Item') {
      setCurrentView('list-item');
    } else if (feature === 'My Orders') {
      setCurrentView('overview');
    } else {
      alert(`Stylus Demo: The '${feature}' feature is available in the full production release.`);
    }
  };

  const handleAction = (action: string, item: string) => {
    alert(`Request received: ${action} for ${item}.\nA concierge will contact you shortly to coordinate.`);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      // Create a fake local URL for demo purposes
      setNewItem({ ...newItem, imageUrl: URL.createObjectURL(file) });
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
        imageUrl: newItem.imageUrl || 'https://images.unsplash.com/photo-1549439602-43ebca2327af?q=80&w=1000&auto=format&fit=crop',
        availableSizes: sizeInput.split(',').map(s => s.trim()).filter(s => s)
    };

    addProduct(product);
    alert("Item listed successfully! It is now available in the collection.");
    setCurrentView('overview');
    // Reset form
    setNewItem({ name: '', brand: '', category: Category.WOMEN, rentalPrice: 0, retailPrice: 0, description: '', availableSizes: [], imageUrl: '' });
    setSizeInput('');
    setImageFile(null);
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
                  {displayName.charAt(0)}
                </div>
                <h2 className="font-serif text-2xl text-cream mb-1">{displayName}</h2>
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
                  {/* Just showing the first 2 dynamic products as active rentals example */}
                  {products.slice(0, 2).map((product, idx) => (
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
                    <p className="text-cream/70 mb-6 italic">Based on your rental history, our AI stylist suggests:</p>
                    
                    {products.length > 2 && (
                        <div className="flex flex-col items-center">
                          <div className="w-48 h-64 overflow-hidden mb-4 border border-golden-orange/20 shadow-lg">
                            <img src={products[2].imageUrl} alt="Suggestion" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
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
                                {newItem.imageUrl ? (
                                    <div className="flex flex-col items-center">
                                        <img src={newItem.imageUrl} alt="Preview" className="h-32 object-contain mb-2" />
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