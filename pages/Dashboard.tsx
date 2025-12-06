
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Package, Calendar, CreditCard, Settings, LogOut, Diamond, Plus, Upload, Tag, Clock, X, Check, Heart, Eye, Search, Filter, History, ChevronRight, Briefcase, DollarSign, ShieldAlert, FileText, Ban, Trash2, ShoppingBag, Truck, Wallet } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProduct } from '../context/ProductContext';
import { useWishlist } from '../context/WishlistContext';
import { useOrders } from '../context/OrderContext';
import { Category, Product, VerificationStatus, OrderStatus } from '../types';
import { Button } from '../components/Button';
import { UserVerificationForm } from '../components/UserVerificationForm';
import { PartnerVerificationForm } from '../components/PartnerVerificationForm';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { logout, currentUser, submitVerification, updateWallet } = useAuth();
  const { products, addProduct, removeProduct, incrementRentalCount } = useProduct();
  const { wishlist } = useWishlist();
  const { orders, updateOrderStatus } = useOrders();
  
  const [currentView, setCurrentView] = useState('overview');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [verificationModal, setVerificationModal] = useState(false);
  
  // Wallet Funding State
  const [fundModal, setFundModal] = useState(false);
  const [fundAmount, setFundAmount] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Filter products for Partner
  const myListings = products.filter(p => p.ownerId === currentUser?.id);
  // Filter orders for Partner: contains items owned by partner
  const partnerOrders = orders.filter(o => o.items.some(i => i.product.ownerId === currentUser?.id));
  
  // User orders logic
  const userOrders = orders.filter(o => o.id); // In a real app, verify userId matches currentUser.id

  // Split Active vs History
  const activeStatuses: OrderStatus[] = ['Processing', 'Pending Approval', 'Accepted', 'Shipped'];
  const activeOrders = userOrders.filter(o => activeStatuses.includes(o.status));
  const pastOrders = userOrders.filter(o => !activeStatuses.includes(o.status));

  // Handle Verification Submission
  const handleVerificationSubmit = (data: any) => {
      submitVerification(currentUser!.id, data);
      setVerificationModal(false);
      alert("Verification documents submitted successfully. Please wait for Admin approval.");
  };

  const performLogout = () => {
    logout();
    navigate('/login');
  };

  const handleWithdraw = () => {
      const amount = prompt("Enter amount to withdraw ($):");
      if (amount && !isNaN(Number(amount)) && Number(amount) > 0 && Number(amount) <= (currentUser?.walletBalance || 0)) {
          updateWallet(currentUser!.id, -Number(amount));
          alert(`Withdrawal of $${amount} processed to linked account.`);
      } else {
          alert("Invalid amount or insufficient funds.");
      }
  };

  const handleFundWallet = (e: React.FormEvent) => {
      e.preventDefault();
      const amount = Number(fundAmount);
      if (isNaN(amount) || amount <= 0) {
          alert("Please enter a valid amount.");
          return;
      }
      
      setIsProcessingPayment(true);
      // Simulate API call to payment gateway
      setTimeout(() => {
          updateWallet(currentUser!.id, amount);
          setIsProcessingPayment(false);
          setFundModal(false);
          setFundAmount('');
          alert(`Successfully added $${amount} to your Stylus Wallet.`);
      }, 2000);
  };

  const handleAcceptOrder = (orderId: string) => {
      // Update Status
      updateOrderStatus(orderId, 'Accepted');
      
      // Update Rental Counts & Check Auto-Sell
      const order = orders.find(o => o.id === orderId);
      if(order) {
          order.items.forEach(item => {
              if (item.type === 'rent') {
                  incrementRentalCount(item.product.id);
              }
          });
      }

      alert("Order accepted. Item rental stats updated.");
  };

  const handleRejectOrder = (orderId: string) => {
      // Simplistic penalty logic
      if (confirm("Rejecting an order may attract a penalty fee. Continue?")) {
        updateOrderStatus(orderId, 'Cancelled');
        updateWallet(currentUser!.id, -50); // Penalty
        alert("Order rejected. $50 penalty applied.");
      }
  };

  // --- Partner Listing Logic ---
  const [newItem, setNewItem] = useState<Partial<Product>>({
    name: '', brand: '', category: Category.WOMEN, rentalPrice: 0, retailPrice: 0, buyPrice: 0, isForSale: false, description: '', availableSizes: [], images: [], color: '', occasion: '', autoSellAfterRentals: 0
  });
  const [sizeInput, setSizeInput] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if(currentUser?.verificationStatus !== 'Verified') {
        alert("You must be a verified partner to list items.");
        return;
    }
    const product: Product = {
        id: Math.random().toString(36).substr(2, 9),
        name: newItem.name!,
        brand: newItem.brand!,
        category: newItem.category as Category,
        rentalPrice: Number(newItem.rentalPrice),
        retailPrice: Number(newItem.retailPrice),
        buyPrice: Number(newItem.buyPrice),
        isForSale: newItem.isForSale,
        autoSellAfterRentals: Number(newItem.autoSellAfterRentals) || undefined,
        ownerId: currentUser.id,
        description: newItem.description || '',
        images: newItem.images && newItem.images.length > 0 ? newItem.images : ['https://images.unsplash.com/photo-1549439602-43ebca2327af?q=80&w=1000&auto=format&fit=crop'],
        availableSizes: sizeInput.split(',').map(s => s.trim()).filter(s => s),
        color: newItem.color || 'Multi',
        occasion: newItem.occasion || 'General',
        reviews: [],
        rentalCount: 0
    };
    addProduct(product);
    alert("Item listed successfully!");
    setCurrentView('listings');
  };

  const handleRemoveItem = (id: string) => {
    if(confirm("Are you sure you want to remove this item from your store? This cannot be undone.")) {
      removeProduct(id);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setNewItem({ ...newItem, images: [URL.createObjectURL(file)] });
    }
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-espresso pb-20 animate-fade-in">
      
      {/* Verification Modal */}
      {verificationModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4">
              <div className="max-w-md w-full relative">
                  <button onClick={() => setVerificationModal(false)} className="absolute -top-10 right-0 text-cream hover:text-golden-orange"><X/></button>
                  {currentUser.role === 'User' ? (
                      <UserVerificationForm onSubmit={handleVerificationSubmit} />
                  ) : (
                      <PartnerVerificationForm onSubmit={handleVerificationSubmit} />
                  )}
              </div>
          </div>
      )}

      {/* Fund Wallet Payment Modal */}
      {fundModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="bg-[#1f0c05] border border-golden-orange w-full max-w-md p-8 relative shadow-2xl rounded-sm">
                  <button onClick={() => setFundModal(false)} className="absolute top-4 right-4 text-cream/50 hover:text-golden-orange"><X size={24}/></button>
                  <h2 className="font-serif text-2xl text-cream mb-2">Fund Your Wallet</h2>
                  <p className="text-xs text-cream/50 mb-6 uppercase tracking-widest">Secure Payment Gateway</p>
                  
                  <form onSubmit={handleFundWallet} className="space-y-4">
                      <div>
                          <label className="text-xs text-cream/50 mb-1 block uppercase">Amount to Add ($)</label>
                          <div className="relative">
                              <DollarSign size={16} className="absolute left-3 top-3 text-golden-orange"/>
                              <input 
                                type="number" 
                                required 
                                min="10" 
                                value={fundAmount} 
                                onChange={e => setFundAmount(e.target.value)} 
                                className="w-full bg-black/20 border border-white/10 pl-10 p-3 text-cream focus:border-golden-orange outline-none font-serif text-lg" 
                                placeholder="0.00"
                              />
                          </div>
                      </div>

                      <div className="border-t border-white/10 pt-4 mt-4">
                          <label className="text-xs text-cream/50 mb-3 block uppercase flex items-center gap-2"><CreditCard size={14}/> Card Details</label>
                          <div className="space-y-3">
                              <input required type="text" placeholder="Card Number (0000 0000 0000 0000)" className="w-full bg-black/20 border border-white/10 p-3 text-cream text-sm focus:border-golden-orange outline-none rounded-sm" />
                              <div className="grid grid-cols-2 gap-3">
                                  <input required type="text" placeholder="MM / YY" className="w-full bg-black/20 border border-white/10 p-3 text-cream text-sm focus:border-golden-orange outline-none rounded-sm" />
                                  <input required type="text" placeholder="CVV" className="w-full bg-black/20 border border-white/10 p-3 text-cream text-sm focus:border-golden-orange outline-none rounded-sm" />
                              </div>
                              <input required type="text" placeholder="Cardholder Name" className="w-full bg-black/20 border border-white/10 p-3 text-cream text-sm focus:border-golden-orange outline-none rounded-sm" />
                          </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-2 mb-4">
                         <div className="w-full h-px bg-white/10"></div>
                         <span className="text-[10px] text-cream/30 uppercase whitespace-nowrap">Secured by Stripe</span>
                         <div className="w-full h-px bg-white/10"></div>
                      </div>

                      <Button fullWidth disabled={isProcessingPayment}>
                          {isProcessingPayment ? 'Processing Transaction...' : `Pay $${fundAmount || '0.00'}`}
                      </Button>
                  </form>
              </div>
          </div>
      )}

      {/* Logout Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setShowLogoutConfirm(false)}>
            <div className="bg-[#1f0c05] border border-golden-orange w-full max-w-md p-8 text-center relative" onClick={e => e.stopPropagation()}>
                <h2 className="font-serif text-2xl text-cream mb-2">Sign Out</h2>
                <div className="flex gap-4 justify-center mt-6">
                    <Button variant="outline" onClick={() => setShowLogoutConfirm(false)}>Cancel</Button>
                    <Button onClick={performLogout}>Confirm</Button>
                </div>
            </div>
        </div>
      )}

      {/* Header */}
      <div className="h-48 bg-[#1a0a04] border-b border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#e1af4d 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar */}
          <div className="w-full md:w-1/4">
            <div className="bg-[#1f0c05] border border-golden-orange/20 p-6 shadow-2xl relative text-center">
               <div className="w-20 h-20 bg-golden-orange rounded-full mx-auto mb-4 flex items-center justify-center text-espresso text-2xl font-serif font-bold border-4 border-[#1f0c05]">
                  {currentUser.name.charAt(0)}
               </div>
               <h2 className="font-serif text-xl text-cream">{currentUser.name}</h2>
               <div className="flex justify-center items-center gap-2 mt-2">
                   <span className={`text-[10px] px-2 py-0.5 uppercase tracking-widest border rounded ${currentUser.role === 'Partner' ? 'border-blue-400 text-blue-400' : 'border-golden-orange text-golden-orange'}`}>
                       {currentUser.role}
                   </span>
                   <span className={`text-[10px] px-2 py-0.5 uppercase tracking-widest border rounded ${currentUser.verificationStatus === 'Verified' ? 'border-green-400 text-green-400' : 'border-red-400 text-red-400'}`}>
                       {currentUser.verificationStatus}
                   </span>
               </div>
               
               {/* Wallet Preview */}
               <div className="mt-6 pt-4 border-t border-white/10">
                   <div className="flex justify-between items-center mb-1">
                       <p className="text-xs uppercase text-cream/40">Wallet Balance</p>
                       <Wallet size={14} className="text-golden-orange"/>
                   </div>
                   <p className="text-2xl font-serif text-golden-orange mb-3">${currentUser.walletBalance.toFixed(2)}</p>
                   
                   {currentUser.role === 'Partner' ? (
                       <button onClick={handleWithdraw} className="w-full bg-white/5 border border-white/10 text-cream py-2 text-xs uppercase font-bold hover:bg-white/10 transition-colors">Withdraw Funds</button>
                   ) : (
                       <button onClick={() => setFundModal(true)} className="w-full bg-golden-orange text-espresso py-2 text-xs uppercase font-bold hover:bg-white hover:text-espresso transition-colors shadow-lg">Fund Wallet</button>
                   )}
               </div>

               {currentUser.verificationStatus !== 'Verified' && currentUser.verificationStatus !== 'Pending' && (
                   <button onClick={() => setVerificationModal(true)} className="w-full mt-4 bg-red-500/10 text-red-400 border border-red-500/50 py-2 text-xs uppercase font-bold hover:bg-red-500 hover:text-white transition-colors">
                       {currentUser.role === 'Partner' ? 'Complete Business Verification' : 'Verify Identity'}
                   </button>
               )}
            </div>

            <nav className="mt-4 space-y-2">
              {currentUser.role === 'Partner' ? (
                  <>
                    <button onClick={() => setCurrentView('overview')} className={`w-full text-left px-4 py-3 border-l-2 transition-all ${currentView === 'overview' ? 'border-golden-orange bg-white/5 text-golden-orange' : 'border-transparent text-cream hover:bg-white/5'}`}>Dashboard</button>
                    <button onClick={() => setCurrentView('listings')} className={`w-full text-left px-4 py-3 border-l-2 transition-all ${currentView === 'listings' ? 'border-golden-orange bg-white/5 text-golden-orange' : 'border-transparent text-cream hover:bg-white/5'}`}>My Listings</button>
                    <button onClick={() => setCurrentView('add-item')} className={`w-full text-left px-4 py-3 border-l-2 transition-all ${currentView === 'add-item' ? 'border-golden-orange bg-white/5 text-golden-orange' : 'border-transparent text-cream hover:bg-white/5'}`}>Add New Item</button>
                    <button onClick={() => setCurrentView('orders')} className={`w-full text-left px-4 py-3 border-l-2 transition-all ${currentView === 'orders' ? 'border-golden-orange bg-white/5 text-golden-orange' : 'border-transparent text-cream hover:bg-white/5'}`}>Orders ({partnerOrders.length})</button>
                  </>
              ) : (
                  <>
                    <button onClick={() => setCurrentView('overview')} className={`w-full text-left px-4 py-3 border-l-2 transition-all ${currentView === 'overview' ? 'border-golden-orange bg-white/5 text-golden-orange' : 'border-transparent text-cream hover:bg-white/5'}`}>Active Activity</button>
                    <button onClick={() => setCurrentView('history')} className={`w-full text-left px-4 py-3 border-l-2 transition-all ${currentView === 'history' ? 'border-golden-orange bg-white/5 text-golden-orange' : 'border-transparent text-cream hover:bg-white/5'}`}>Order History</button>
                    <button onClick={() => setCurrentView('wishlist')} className={`w-full text-left px-4 py-3 border-l-2 transition-all ${currentView === 'wishlist' ? 'border-golden-orange bg-white/5 text-golden-orange' : 'border-transparent text-cream hover:bg-white/5'}`}>Wishlist</button>
                  </>
              )}
               <button onClick={() => setShowLogoutConfirm(true)} className="w-full text-left px-4 py-3 text-red-400 hover:bg-white/5 transition-colors">Sign Out</button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="w-full md:w-3/4">
             {/* --- PARTNER VIEWS --- */}
             {currentUser.role === 'Partner' && currentView === 'overview' && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="bg-white/5 p-6 border border-white/10">
                         <h3 className="text-cream/50 uppercase text-xs">Total Earnings</h3>
                         <p className="text-3xl text-golden-orange font-serif">${currentUser.walletBalance}</p>
                     </div>
                     <div className="bg-white/5 p-6 border border-white/10">
                         <h3 className="text-cream/50 uppercase text-xs">Active Listings</h3>
                         <p className="text-3xl text-cream font-serif">{myListings.length}</p>
                     </div>
                     <div className="bg-white/5 p-6 border border-white/10">
                         <h3 className="text-cream/50 uppercase text-xs">Pending Orders</h3>
                         <p className="text-3xl text-cream font-serif">{partnerOrders.filter(o => o.status === 'Pending Approval').length}</p>
                     </div>
                     <div className="bg-white/5 p-6 border border-white/10">
                         <h3 className="text-cream/50 uppercase text-xs">Verification</h3>
                         <p className={`text-xl font-serif ${currentUser.verificationStatus === 'Verified' ? 'text-green-400' : 'text-red-400'}`}>{currentUser.verificationStatus}</p>
                     </div>
                 </div>
             )}

             {currentUser.role === 'Partner' && currentView === 'add-item' && (
                 <div className="bg-white/5 border border-white/10 p-8">
                     <h3 className="font-serif text-2xl text-cream mb-6">List New Attire</h3>
                     {currentUser.verificationStatus !== 'Verified' ? (
                         <div className="bg-red-500/10 border border-red-500/50 p-4 text-red-400 flex items-center gap-3">
                             <Ban /> <span>You must complete business verification to list items.</span>
                             <button onClick={() => setVerificationModal(true)} className="underline font-bold">Verify Now</button>
                         </div>
                     ) : (
                         <form onSubmit={handleAddItem} className="space-y-6">
                            {/* ... (Existing Partner Form) ... */}
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs text-cream/50 mb-1 block">Item Name</label>
                                    <input required placeholder="e.g. Vintage Chanel Suit" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} className="w-full bg-black/20 border border-white/10 p-3 text-cream focus:border-golden-orange outline-none" />
                                </div>
                                <div>
                                    <label className="text-xs text-cream/50 mb-1 block">Brand</label>
                                    <input required placeholder="e.g. Chanel" value={newItem.brand} onChange={e => setNewItem({...newItem, brand: e.target.value})} className="w-full bg-black/20 border border-white/10 p-3 text-cream focus:border-golden-orange outline-none" />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-6">
                                <div>
                                    <label className="text-xs text-cream/50 mb-1 block">Rent Price ($)</label>
                                    <input required type="number" placeholder="0.00" value={newItem.rentalPrice} onChange={e => setNewItem({...newItem, rentalPrice: Number(e.target.value)})} className="w-full bg-black/20 border border-white/10 p-3 text-cream focus:border-golden-orange outline-none" />
                                </div>
                                <div>
                                    <label className="text-xs text-cream/50 mb-1 block">Buy Price ($)</label>
                                    <input type="number" placeholder="0.00 (Optional)" value={newItem.buyPrice} onChange={e => setNewItem({...newItem, buyPrice: Number(e.target.value)})} className="w-full bg-black/20 border border-white/10 p-3 text-cream focus:border-golden-orange outline-none" />
                                </div>
                                <div className="flex flex-col justify-end pb-3">
                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" checked={newItem.isForSale} onChange={e => setNewItem({...newItem, isForSale: e.target.checked})} className="w-5 h-5 accent-golden-orange" />
                                        <label className="text-cream text-sm">Available for Sale</label>
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <label className="text-xs text-cream/50 mb-1 block">Sizes (comma separated)</label>
                                <input required placeholder="S, M, L" value={sizeInput} onChange={e => setSizeInput(e.target.value)} className="w-full bg-black/20 border border-white/10 p-3 text-cream focus:border-golden-orange outline-none" />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs text-cream/50 mb-1 block">Description</label>
                                    <textarea required rows={4} value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} className="w-full bg-black/20 border border-white/10 p-3 text-cream focus:border-golden-orange outline-none" />
                                </div>
                                <div>
                                    <label className="text-xs text-cream/50 mb-1 block">Auto-sell Threshold (Rentals)</label>
                                    <p className="text-xs text-cream/40 mb-2">Automatically convert to 'For Sale' after this many rentals.</p>
                                    <input type="number" placeholder="e.g. 10" value={newItem.autoSellAfterRentals || ''} onChange={e => setNewItem({...newItem, autoSellAfterRentals: Number(e.target.value)})} className="w-full bg-black/20 border border-white/10 p-3 text-cream focus:border-golden-orange outline-none" />
                                </div>
                            </div>

                            <div className="border-2 border-dashed border-white/10 p-6 text-center cursor-pointer">
                                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="img-upload" />
                                <label htmlFor="img-upload" className="cursor-pointer text-cream/60">
                                    {newItem.images && newItem.images.length > 0 ? "Image Selected" : "Click to Upload Image"}
                                </label>
                            </div>
                            <Button fullWidth type="submit">Publish Listing</Button>
                         </form>
                     )}
                 </div>
             )}

             {currentUser.role === 'Partner' && currentView === 'listings' && (
                 <div className="space-y-4">
                     <h3 className="font-serif text-2xl text-cream mb-6">My Inventory</h3>
                     {myListings.length === 0 ? <p className="text-cream/50">No items listed.</p> : myListings.map(item => (
                         <div key={item.id} className="bg-white/5 p-4 flex gap-4 border border-white/10">
                             <img src={item.images[0]} className="w-24 h-32 object-cover" />
                             <div className="flex-grow">
                                 <h4 className="text-cream font-bold text-lg">{item.name}</h4>
                                 <div className="flex flex-wrap gap-4 text-sm text-cream/70 mt-1">
                                     <span>Rent: ${item.rentalPrice}</span>
                                     {item.isForSale && <span>Buy: ${item.buyPrice}</span>}
                                 </div>
                                 <div className="flex items-center gap-4 mt-2">
                                    <span className="text-xs text-cream/50 bg-black/20 px-2 py-1 rounded">Rentals: {item.rentalCount || 0}</span>
                                    {item.autoSellAfterRentals && <span className="text-xs text-golden-orange bg-golden-orange/10 px-2 py-1 rounded border border-golden-orange/30">Auto-sell at: {item.autoSellAfterRentals}</span>}
                                 </div>
                                 <div className="flex gap-2 mt-4">
                                     <button className="text-xs border border-white/20 px-3 py-1 text-cream hover:border-golden-orange">Edit</button>
                                     <button onClick={() => handleRemoveItem(item.id)} className="text-xs border border-red-500/20 px-3 py-1 text-red-400 hover:bg-red-500/10 flex items-center gap-1"><Trash2 size={12}/> Remove</button>
                                 </div>
                             </div>
                         </div>
                     ))}
                 </div>
             )}

            {currentUser.role === 'Partner' && currentView === 'orders' && (
                 <div className="space-y-4">
                     <h3 className="font-serif text-2xl text-cream mb-6">Incoming Orders</h3>
                     {partnerOrders.length === 0 ? <p className="text-cream/50">No orders yet.</p> : partnerOrders.map(order => (
                         <div key={order.id} className="bg-white/5 p-6 border border-white/10">
                             <div className="flex justify-between items-start mb-4">
                                 <div>
                                     <p className="text-xs text-cream/40 uppercase">Order ID: {order.id}</p>
                                     <p className="text-cream font-bold">{order.date}</p>
                                 </div>
                                 <span className={`text-xs px-2 py-1 border rounded ${order.status === 'Pending Approval' ? 'border-yellow-500 text-yellow-500' : 'border-white/20 text-cream'}`}>{order.status}</span>
                             </div>
                             {order.items.map((item, idx) => (
                                 <div key={idx} className="flex gap-4 mb-4 bg-black/20 p-2">
                                     <img src={item.product.images[0]} className="w-12 h-16 object-cover" />
                                     <div>
                                         <p className="text-cream text-sm">{item.product.name}</p>
                                         <p className="text-xs text-golden-orange">{item.type === 'buy' ? 'Purchase' : `Rental (${item.duration} days)`}</p>
                                         <p className="text-xs text-cream/50">Price: ${item.price}</p>
                                     </div>
                                 </div>
                             ))}
                             {order.status === 'Pending Approval' && (
                                 <div className="flex gap-3 mt-4 border-t border-white/5 pt-4">
                                     <button onClick={() => handleAcceptOrder(order.id)} className="bg-green-500/20 text-green-400 px-4 py-2 text-sm border border-green-500/50 hover:bg-green-500 hover:text-white transition-colors">Accept Order</button>
                                     <button onClick={() => handleRejectOrder(order.id)} className="bg-red-500/20 text-red-400 px-4 py-2 text-sm border border-red-500/50 hover:bg-red-500 hover:text-white transition-colors">Reject (Penalty Applies)</button>
                                 </div>
                             )}
                         </div>
                     ))}
                 </div>
             )}

             {/* --- USER VIEWS --- */}
             {currentUser.role === 'User' && currentView === 'overview' && (
                 <div>
                     <h3 className="font-serif text-2xl text-cream mb-6">Current Overview</h3>
                     {currentUser.verificationStatus === 'Verified' && (
                         <div className="bg-green-500/10 border border-green-500/30 p-4 mb-6 flex items-center gap-3 rounded-sm">
                             <div className="bg-green-500 text-espresso p-1 rounded-full"><Check size={14}/></div>
                             <div>
                                 <h4 className="text-green-400 font-bold text-sm uppercase tracking-wide">Account Verified</h4>
                                 <p className="text-cream/60 text-xs">You have full access to rent and buy from the Stylus Vault.</p>
                             </div>
                         </div>
                     )}
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                         <div className="bg-[#1f0c05] border border-white/10 p-6 relative overflow-hidden">
                             <div className="absolute top-0 right-0 p-4 opacity-10"><ShoppingBag size={64}/></div>
                             <h4 className="text-cream font-bold text-lg mb-1">Active Rentals</h4>
                             <p className="text-3xl font-serif text-golden-orange">{activeOrders.length}</p>
                             <p className="text-xs text-cream/50 mt-2">Items currently in your possession or processing.</p>
                         </div>
                         <div className="bg-[#1f0c05] border border-white/10 p-6 relative overflow-hidden">
                             <div className="absolute top-0 right-0 p-4 opacity-10"><History size={64}/></div>
                             <h4 className="text-cream font-bold text-lg mb-1">Total History</h4>
                             <p className="text-3xl font-serif text-cream">{pastOrders.length}</p>
                             <p className="text-xs text-cream/50 mt-2">Completed orders (Returned or Purchased).</p>
                         </div>
                     </div>

                     <h4 className="font-serif text-xl text-cream mb-4 border-b border-white/10 pb-2">Active Engagements</h4>
                     {activeOrders.length === 0 ? <p className="text-cream/50 italic py-4">No active rentals or purchases pending.</p> : (
                         <div className="grid gap-4">
                             {activeOrders.map(o => (
                                 <div key={o.id} className="bg-white/5 p-4 border border-white/10 flex flex-col sm:flex-row gap-4">
                                     <div className="flex-1">
                                        <div className="flex justify-between mb-2">
                                            <span className="text-golden-orange font-bold">Order {o.id}</span>
                                            <span className={`text-xs px-2 py-0.5 rounded border uppercase font-bold tracking-wide ${o.status === 'Shipped' ? 'border-green-400 text-green-400' : 'border-yellow-400 text-yellow-400'}`}>
                                                {o.status}
                                            </span>
                                        </div>
                                        <p className="text-xs text-cream/40 mb-3">{o.date}</p>
                                        <div className="space-y-3">
                                            {o.items.map(i => (
                                                <div key={i.id} className="flex gap-3 bg-black/20 p-2 rounded">
                                                    <img src={i.product.images[0]} className="w-12 h-16 object-cover" />
                                                    <div>
                                                        <p className="text-sm text-cream font-bold">{i.product.name}</p>
                                                        <p className="text-xs text-golden-orange">{i.type === 'buy' ? 'Purchase' : `Rent (${i.duration} Days)`}</p>
                                                        {i.type === 'rent' && i.endDate && (
                                                            <p className="text-[10px] text-cream/50 flex items-center gap-1 mt-1"><Clock size={10}/> Return by: {i.endDate}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                     </div>
                                     <div className="w-full sm:w-48 border-t sm:border-t-0 sm:border-l border-white/10 pt-4 sm:pt-0 sm:pl-4 flex flex-col justify-center">
                                         {o.status === 'Shipped' && (
                                             <div className="mb-4">
                                                 <p className="text-[10px] uppercase text-cream/40 mb-1">Tracking</p>
                                                 <p className="text-xs text-cream flex items-center gap-1"><Truck size={12}/> UPS: 1Z999...</p>
                                             </div>
                                         )}
                                         <p className="text-[10px] uppercase text-cream/40">Total Value</p>
                                         <p className="text-xl font-serif text-cream">${o.total}</p>
                                     </div>
                                 </div>
                             ))}
                         </div>
                     )}
                 </div>
             )}

             {currentUser.role === 'User' && currentView === 'history' && (
                 <div>
                     <h3 className="font-serif text-2xl text-cream mb-6">Order History</h3>
                     {pastOrders.length === 0 ? <div className="bg-white/5 p-8 text-center"><p className="text-cream/50">No historical data found.</p></div> : (
                         <div className="space-y-4">
                             {pastOrders.map(o => (
                                 <div key={o.id} className="bg-white/5 border border-white/5 rounded-sm p-6 hover:border-golden-orange/30 transition-colors">
                                     <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 pb-4 border-b border-white/5 gap-4">
                                         <div>
                                             <div className="flex items-center gap-3">
                                                <span className="text-lg font-bold text-cream">Order {o.id}</span>
                                                <span className={`text-[10px] uppercase px-2 py-0.5 rounded border ${o.status === 'Completed' ? 'border-green-500 text-green-500' : 'border-red-500 text-red-500'}`}>{o.status}</span>
                                             </div>
                                             <span className="text-xs text-cream/40">{o.date}</span>
                                         </div>
                                         <div className="text-right">
                                             <p className="text-2xl font-serif text-golden-orange">${o.total}</p>
                                             <button className="text-xs text-cream underline hover:text-golden-orange">View Receipt</button>
                                         </div>
                                     </div>
                                     
                                     <div className="grid gap-2">
                                         {o.items.map(item => (
                                             <div key={item.id} className="flex items-center gap-4 py-2">
                                                 <img src={item.product.images[0]} className="w-10 h-10 object-cover rounded bg-white/10" />
                                                 <div className="flex-grow">
                                                     <p className="text-sm text-cream">{item.product.name}</p>
                                                     <p className="text-xs text-cream/50">{item.product.brand}</p>
                                                 </div>
                                                 <div className="text-right">
                                                     <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${item.type === 'buy' ? 'bg-blue-500/10 text-blue-400' : 'bg-golden-orange/10 text-golden-orange'}`}>
                                                         {item.type === 'buy' ? 'Purchased' : 'Rented'}
                                                     </span>
                                                 </div>
                                                 <div className="w-20 text-right text-sm text-cream/70">${item.price}</div>
                                             </div>
                                         ))}
                                     </div>
                                 </div>
                             ))}
                         </div>
                     )}
                 </div>
             )}

              {currentUser.role === 'User' && currentView === 'wishlist' && (
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     {wishlist.length === 0 ? <p className="text-cream/50">Wishlist is empty.</p> : wishlist.map(p => (
                         <div key={p.id} className="bg-white/5 p-4 border border-white/10">
                             <img src={p.images[0]} className="w-full h-40 object-cover mb-4" />
                             <p className="text-cream font-bold truncate">{p.name}</p>
                             <p className="text-golden-orange text-sm">${p.rentalPrice} / rent</p>
                             <Link to={`/product/${p.id}`}>
                                <Button fullWidth variant="secondary" className="mt-4 text-xs">View Details</Button>
                             </Link>
                         </div>
                     ))}
                 </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};
