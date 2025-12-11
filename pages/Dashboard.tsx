
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Package, Calendar, CreditCard, Settings, LogOut, Diamond, Plus, Upload, Tag, Clock, X, Check, Heart, Eye, Search, Filter, History, ChevronRight, Briefcase, DollarSign, ShieldAlert, FileText, Ban, Trash2, ShoppingBag, Truck, Wallet, ShieldCheck, Banknote, ArrowUpRight, ArrowDownLeft, AlertCircle, Image as ImageIcon, Loader2, Bike, Car, MapPin, Phone, User, Power, AlertTriangle, RotateCcw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProduct } from '../context/ProductContext';
import { useWishlist } from '../context/WishlistContext';
import { useOrders } from '../context/OrderContext';
import { Category, Product, VerificationStatus, OrderStatus, DeliveryDetails } from '../types';
import { Button } from '../components/Button';
import { UserVerificationForm } from '../components/UserVerificationForm';
import { PartnerVerificationForm } from '../components/PartnerVerificationForm';
import { checkRentalThreshold } from '../services/geminiService';
import { PaymentModal } from '../components/PaymentModal'; // Imported PaymentModal

// --- Tracking Component ---
const OrderTimeline: React.FC<{ status: OrderStatus, type: 'rent' | 'buy' }> = ({ status, type }) => {
    const steps = type === 'buy' 
        ? ['Processing', 'Accepted', 'Shipped', 'Completed']
        : ['Processing', 'Accepted', 'Shipped', 'Delivered', 'Returned', 'Completed'];
        
    // Map status to index. Handle 'Delivered' mapping to 'Completed' for buys visually if needed
    let currentIdx = steps.indexOf(status);
    if (status === 'Pending Approval') currentIdx = 0; // Treat as processing visually
    
    // If status isn't in steps (e.g. Rejected), show nothing or error
    if (status === 'Rejected' || status === 'Cancelled') {
        return <div className="text-red-500 text-[10px] font-bold uppercase tracking-widest mt-2 border border-red-500/50 p-1 inline-block rounded">Order {status}</div>;
    }

    return (
        <div className="w-full mt-3 mb-2 px-1">
            <div className="flex items-center justify-between relative">
                {/* Connecting Line */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-white/10 -z-0"></div>
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-golden-orange -z-0 transition-all duration-500" style={{ width: `${(currentIdx / (steps.length - 1)) * 100}%` }}></div>

                {steps.map((step, idx) => (
                    <div key={step} className="flex flex-col items-center relative z-10 group">
                        <div className={`w-2.5 h-2.5 rounded-full border-2 transition-colors duration-300 ${idx <= currentIdx ? 'bg-golden-orange border-golden-orange' : 'bg-[#1f0c05] border-white/30'}`}></div>
                        <span className={`text-[8px] uppercase mt-1.5 font-bold transition-colors duration-300 absolute -bottom-5 w-20 text-center ${idx <= currentIdx ? 'text-golden-orange' : 'text-white/20'}`}>
                            {step}
                        </span>
                    </div>
                ))}
            </div>
            <div className="h-4"></div>{/* Spacer for text */}
        </div>
    );
};

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { logout, currentUser, submitVerification, updateWallet, requestWithdrawal, transactions } = useAuth();
  const { products, addProduct, removeProduct, incrementRentalCount, toggleProductAvailability } = useProduct();
  const { wishlist } = useWishlist();
  const { orders, updateOrderItemStatus, assignLogistics } = useOrders();
  
  const [currentView, setCurrentView] = useState('overview');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [verificationModal, setVerificationModal] = useState(false);
  
  // Wallet Funding & Withdrawal State
  const [fundModal, setFundModal] = useState(false);
  const [fundStep, setFundStep] = useState<'amount' | 'payment'>('amount'); // Steps: Input Amount -> Payment Modal
  const [withdrawModal, setWithdrawModal] = useState(false);
  const [fundAmount, setFundAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [bankDetails, setBankDetails] = useState({ bankName: '', accountNumber: '', accountName: '' });

  // Dispatch / Logistics Modal State
  const [dispatchModal, setDispatchModal] = useState(false);
  const [dispatchItem, setDispatchItem] = useState<{orderId: string, itemId: string, productName: string} | null>(null);
  const [logisticsData, setLogisticsData] = useState<Partial<DeliveryDetails>>({ courier: 'Uber Connect', riderName: '', riderPhone: '', trackingNumber: '' });

  // Filter products for Partner
  const myListings = products.filter(p => p.ownerId === currentUser?.id);
  
  // Filter orders for Partner: Orders that contain items owned by this partner
  const partnerOrders = orders.filter(o => o.items.some(i => i.product.ownerId === currentUser?.id));
  
  // User orders logic
  const userOrders = orders.filter(o => o.userId === currentUser?.id);
  
  // Transaction History for current user
  const userTransactions = transactions.filter(t => t.userId === currentUser?.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Split Active vs History based on items (if any item is active, show order in active)
  const activeStatuses: OrderStatus[] = ['Processing', 'Pending Approval', 'Accepted', 'Shipped', 'Delivered', 'Returned'];
  
  const activeOrders = userOrders.filter(o => o.items.some(i => activeStatuses.includes(i.status)));
  const pastOrders = userOrders.filter(o => !activeOrders.includes(o));

  // Handle Verification Submission
  const handleVerificationSubmit = (data: any) => {
      if (!currentUser) return;
      submitVerification(currentUser.id, data);
      setVerificationModal(false);
  };

  const performLogout = () => {
    logout();
    navigate('/login');
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const amount = Number(withdrawAmount);
      if (isNaN(amount) || amount <= 0) {
          alert("Invalid amount.");
          return;
      }
      if (amount > (currentUser?.walletBalance || 0)) {
          alert("Insufficient funds.");
          return;
      }
      
      const confirmMessage = 
`CONFIRM WITHDRAWAL REQUEST

Amount: $${amount.toFixed(2)}
Bank: ${bankDetails.bankName}
Account Number: ${bankDetails.accountNumber}
Account Name: ${bankDetails.accountName}

Proceed with this transaction?`;

      if (window.confirm(confirmMessage)) {
          const details = `${bankDetails.bankName} - ${bankDetails.accountNumber} (${bankDetails.accountName})`;
          requestWithdrawal(currentUser!.id, amount, details);
          setWithdrawModal(false);
          setWithdrawAmount('');
          alert("Withdrawal request submitted for processing.");
      }
  };

  // 1. Initial Step: User enters amount
  const handleFundAmountSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const amount = Number(fundAmount);
      if (isNaN(amount) || amount <= 0) {
          alert("Please enter a valid amount.");
          return;
      }
      setFundStep('payment'); // Move to Payment Gateway
  };

  // 2. Final Step: Callback from PaymentModal
  const handleFundSuccess = (txId: string) => {
      if (currentUser) {
        updateWallet(currentUser.id, Number(fundAmount), `Wallet Funding (TX: ${txId})`, 'Credit');
        setFundModal(false);
        setFundAmount('');
        setFundStep('amount');
        // No alert needed, modal success state handles it
      }
  };

  // Partner Action: Accept specific Item
  const handleAcceptItem = (orderId: string, itemId: string, productId: string, price: number) => {
      if (currentUser?.status === 'Suspended') {
          alert("Action Blocked: Your account is suspended.");
          return;
      }
      updateOrderItemStatus(orderId, itemId, 'Accepted');
      incrementRentalCount(productId);
      if (currentUser) {
          updateWallet(currentUser.id, price, `Rental Earnings: Order #${orderId}`, 'Credit');
      }
      alert("Item accepted. Ready for Dispatch.");
  };

  const openDispatchModal = (orderId: string, itemId: string, productName: string) => {
      setDispatchItem({ orderId, itemId, productName });
      setLogisticsData({ courier: 'Uber Connect', riderName: '', riderPhone: '', trackingNumber: '' });
      setDispatchModal(true);
  };

  const submitDispatch = (e: React.FormEvent) => {
      e.preventDefault();
      if (!dispatchItem) return;

      const details: DeliveryDetails = {
          courier: logisticsData.courier || 'Private Rider',
          riderName: logisticsData.riderName,
          riderPhone: logisticsData.riderPhone,
          trackingNumber: logisticsData.trackingNumber,
          dispatchTime: new Date().toLocaleString(),
          estimatedArrival: 'In 2-4 Hours'
      };

      assignLogistics(dispatchItem.orderId, dispatchItem.itemId, details);
      setDispatchModal(false);
      setDispatchItem(null);
      alert("Dispatch Assigned. User has been notified.");
  };

  const handleRejectItem = (orderId: string, itemId: string) => {
      if (currentUser?.status === 'Suspended') {
           alert("Action Blocked: Your account is suspended.");
           return;
      }
      
      const order = orders.find(o => o.id === orderId);
      const item = order?.items.find(i => i.id === itemId);
      
      if (!order || !item) return;

      const penaltyAmount = Math.round(item.price * 0.15); // 15% Penalty
      const confirmMessage = 
`IMPORTANT: REJECTION PENALTY

Rejecting a confirmed request indicates a failure to fulfill inventory.

1. The customer will be fully refunded ($${item.price}).
2. You will be charged a Non-Fulfillment Penalty of $${penaltyAmount} (15%).

To avoid this in the future, please mark items as "Out of Order" in your listings if they are unavailable.

Do you wish to proceed with rejection?`;

      if (confirm(confirmMessage)) {
        updateOrderItemStatus(orderId, itemId, 'Rejected');
        updateWallet(order.userId, item.price, `Refund: Request Declined for ${item.product.name}`, 'Credit');
        if (currentUser) {
            updateWallet(currentUser.id, -penaltyAmount, `Penalty: Order Rejection (${item.product.name})`, 'Fee');
        }
        alert(`Item rejected. Customer refunded. Penalty of $${penaltyAmount} charged.`);
      }
  };

  const handleUserReceiveItem = (orderId: string, itemId: string, type: 'rent' | 'buy') => {
      const nextStatus = type === 'buy' ? 'Completed' : 'Delivered';
      const msg = type === 'buy' 
        ? "Confirm you have received your purchase? This will complete the transaction." 
        : "Confirm you have received the rental? This marks the start of your rental period.";

      if (confirm(msg)) {
          updateOrderItemStatus(orderId, itemId, nextStatus);
      }
  };

  const handleReturnItem = (orderId: string, itemId: string) => {
      if (confirm("Are you ready to return this item? A courier will be notified for pickup.")) {
          updateOrderItemStatus(orderId, itemId, 'Returned');
      }
  };

  const handlePartnerConfirmReturn = (orderId: string, itemId: string) => {
      if (confirm("Confirm that you have received the item back in good condition? This completes the order.")) {
          updateOrderItemStatus(orderId, itemId, 'Completed');
      }
  };

  // --- Partner Listing Logic ---
  const [newItem, setNewItem] = useState<Partial<Product>>({
    name: '', brand: '', category: Category.WOMEN, rentalPrice: 0, retailPrice: 0, buyPrice: 0, isForSale: false, description: '', availableSizes: [], images: [], color: '', occasion: '', autoSellAfterRentals: 0
  });
  const [sizeInput, setSizeInput] = useState('');
  
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser?.status === 'Suspended') {
        alert("Action Blocked: Your account is suspended.");
        return;
    }
    if(currentUser?.verificationStatus !== 'Verified') {
        alert("You must be a verified partner to list items.");
        return;
    }
    if (currentUser) {
        const product: Product = {
            id: Math.random().toString(36).substr(2, 9),
            name: newItem.name!,
            brand: newItem.brand!,
            category: newItem.category as Category,
            rentalPrice: Number(newItem.rentalPrice),
            retailPrice: Number(newItem.retailPrice),
            buyPrice: Number(newItem.buyPrice),
            isForSale: newItem.isForSale,
            isAvailable: true,
            autoSellAfterRentals: 5,
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
        alert("Item listed successfully! It is now visible globally.");
        setCurrentView('listings');
    }
  };

  const handleRemoveItem = (id: string) => {
    if(confirm("Are you sure you want to remove this item from your store? This cannot be undone.")) {
      removeProduct(id);
    }
  };

  const handleToggleAvailability = (product: Product) => {
      toggleProductAvailability(product.id);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImages = Array.from(e.target.files).map((file: File) => URL.createObjectURL(file));
      setNewItem(prev => ({ ...prev, images: [...(prev.images || []), ...newImages] }));
    }
  };

  const removeImage = (index: number) => {
      setNewItem(prev => ({
          ...prev,
          images: prev.images?.filter((_, i) => i !== index)
      }));
  };

  if (!currentUser) {
      return (
          <div className="min-h-screen bg-espresso flex items-center justify-center text-cream">
              <div className="flex flex-col items-center gap-4">
                  <Loader2 className="animate-spin text-golden-orange" size={32} />
                  <p className="text-sm uppercase tracking-widest">Loading Dashboard...</p>
              </div>
          </div>
      );
  }

  if (currentUser.status === 'Suspended') {
      return (
          <div className="min-h-screen bg-espresso flex items-center justify-center p-4">
              <div className="bg-red-900/20 border border-red-500 p-8 max-w-lg text-center rounded-sm">
                  <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <h1 className="text-3xl font-serif text-cream mb-2">Account Suspended</h1>
                  <p className="text-red-300 mb-6 font-bold">{currentUser.suspensionReason || "Violation of Terms of Service"}</p>
                  <p className="text-cream/60 mb-8">Access to trading, renting, and wallet withdrawals has been temporarily revoked. Please contact support.</p>
                  <div className="flex justify-center gap-4">
                      <Button onClick={performLogout}>Sign Out</Button>
                      <Link to="/contact"><Button variant="outline">Contact Support</Button></Link>
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-espresso pb-20 animate-fade-in">
      
      {/* Verification Modal */}
      {verificationModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4">
              <div className="max-w-md w-full relative animate-fade-in">
                  <button onClick={() => setVerificationModal(false)} className="absolute -top-10 right-0 text-cream hover:text-golden-orange"><X/></button>
                  {currentUser.role === 'User' ? (
                      <UserVerificationForm onSubmit={handleVerificationSubmit} />
                  ) : (
                      <PartnerVerificationForm onSubmit={handleVerificationSubmit} />
                  )}
              </div>
          </div>
      )}

      {/* Dispatch Logistics Modal */}
      {dispatchModal && dispatchItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
              <div className="bg-[#1f0c05] border border-golden-orange w-full max-w-md p-8 relative shadow-2xl rounded-sm">
                  <button onClick={() => setDispatchModal(false)} className="absolute top-4 right-4 text-cream/50 hover:text-golden-orange"><X size={24}/></button>
                  <h2 className="font-serif text-2xl text-cream mb-2">Assign Dispatch Rider</h2>
                  <p className="text-xs text-cream/50 mb-6 uppercase tracking-widest">For Item: {dispatchItem.productName}</p>
                  
                  <form onSubmit={submitDispatch} className="space-y-5">
                      <div>
                          <label className="text-xs text-cream/50 mb-1 block uppercase">Logistics Provider</label>
                          <div className="relative">
                            <select 
                                value={logisticsData.courier} 
                                onChange={e => setLogisticsData({...logisticsData, courier: e.target.value})}
                                className="w-full bg-black/20 border border-white/10 p-3 text-cream focus:border-golden-orange outline-none appearance-none cursor-pointer"
                            >
                                <option value="Uber Connect">Uber Connect</option>
                                <option value="Bolt Send">Bolt Send</option>
                                <option value="Gokada">Gokada</option>
                                <option value="DHL Express">DHL Express</option>
                                <option value="Private Rider">Private Rider</option>
                            </select>
                            <Bike size={16} className="absolute right-3 top-3 text-cream/30 pointer-events-none" />
                          </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="text-xs text-cream/50 mb-1 block uppercase">Rider Name</label>
                              <input 
                                required 
                                type="text" 
                                placeholder="e.g. John Doe"
                                value={logisticsData.riderName}
                                onChange={e => setLogisticsData({...logisticsData, riderName: e.target.value})}
                                className="w-full bg-black/20 border border-white/10 p-3 text-cream focus:border-golden-orange outline-none" 
                              />
                          </div>
                          <div>
                              <label className="text-xs text-cream/50 mb-1 block uppercase">Rider Phone</label>
                              <input 
                                required 
                                type="text" 
                                placeholder="+234..."
                                value={logisticsData.riderPhone}
                                onChange={e => setLogisticsData({...logisticsData, riderPhone: e.target.value})}
                                className="w-full bg-black/20 border border-white/10 p-3 text-cream focus:border-golden-orange outline-none" 
                              />
                          </div>
                      </div>

                      <div>
                          <label className="text-xs text-cream/50 mb-1 block uppercase">Tracking No. / Link (Optional)</label>
                          <input 
                            type="text" 
                            placeholder="Share tracking link here"
                            value={logisticsData.trackingNumber}
                            onChange={e => setLogisticsData({...logisticsData, trackingNumber: e.target.value})}
                            className="w-full bg-black/20 border border-white/10 p-3 text-cream focus:border-golden-orange outline-none" 
                          />
                      </div>

                      <div className="bg-golden-orange/10 border border-golden-orange/30 p-3 rounded flex items-start gap-2">
                          <AlertCircle size={16} className="text-golden-orange shrink-0 mt-0.5"/>
                          <p className="text-xs text-golden-orange/80">Updating this status to "Shipped" will notify the customer. Ensure the rider has picked up the item.</p>
                      </div>

                      <Button fullWidth className="mt-2">Confirm Dispatch</Button>
                  </form>
              </div>
          </div>
      )}

      {/* Withdrawal Modal */}
      {withdrawModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
              <div className="bg-[#1f0c05] border border-golden-orange w-full max-w-md p-8 relative shadow-2xl rounded-sm">
                  <button onClick={() => setWithdrawModal(false)} className="absolute top-4 right-4 text-cream/50 hover:text-golden-orange"><X size={24}/></button>
                  <h2 className="font-serif text-2xl text-cream mb-2">Withdraw Earnings</h2>
                  <p className="text-xs text-cream/50 mb-6 uppercase tracking-widest">Process Transfer to Bank</p>
                  
                  <div className="bg-golden-orange/10 p-4 mb-6 border border-golden-orange/20 text-center">
                      <p className="text-xs text-golden-orange uppercase">Available Balance</p>
                      <p className="text-2xl font-serif text-cream">${currentUser.walletBalance.toFixed(2)}</p>
                  </div>

                  <form onSubmit={handleWithdrawSubmit} className="space-y-4">
                      <div>
                          <label className="text-xs text-cream/50 mb-1 block uppercase">Amount to Withdraw ($)</label>
                          <input 
                            type="number" 
                            required 
                            min="10"
                            max={currentUser.walletBalance}
                            value={withdrawAmount} 
                            onChange={e => setWithdrawAmount(e.target.value)} 
                            className="w-full bg-black/20 border border-white/10 p-3 text-cream focus:border-golden-orange outline-none font-serif text-lg" 
                          />
                      </div>
                      
                      <div className="pt-2">
                          <label className="text-xs text-cream/50 mb-2 block uppercase font-bold">Bank Details</label>
                          <div className="space-y-3">
                              <input 
                                required 
                                type="text" 
                                placeholder="Bank Name" 
                                value={bankDetails.bankName}
                                onChange={e => setBankDetails({...bankDetails, bankName: e.target.value})}
                                className="w-full bg-black/20 border border-white/10 p-3 text-cream text-sm focus:border-golden-orange outline-none" 
                              />
                              <input 
                                required 
                                type="text" 
                                placeholder="Account Number" 
                                value={bankDetails.accountNumber}
                                onChange={e => setBankDetails({...bankDetails, accountNumber: e.target.value})}
                                className="w-full bg-black/20 border border-white/10 p-3 text-cream text-sm focus:border-golden-orange outline-none" 
                              />
                               <input 
                                required 
                                type="text" 
                                placeholder="Account Name" 
                                value={bankDetails.accountName}
                                onChange={e => setBankDetails({...bankDetails, accountName: e.target.value})}
                                className="w-full bg-black/20 border border-white/10 p-3 text-cream text-sm focus:border-golden-orange outline-none" 
                              />
                          </div>
                      </div>

                      <Button fullWidth className="mt-4">Submit Request</Button>
                  </form>
              </div>
          </div>
      )}

      {/* Fund Wallet Payment Modal (REPLACED ORIGINAL) */}
      {fundModal && (
          fundStep === 'amount' ? (
              <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
                  <div className="bg-[#1f0c05] border border-golden-orange w-full max-w-md p-8 relative shadow-2xl rounded-sm">
                      <button onClick={() => setFundModal(false)} className="absolute top-4 right-4 text-cream/50 hover:text-golden-orange"><X size={24}/></button>
                      <h2 className="font-serif text-2xl text-cream mb-2">Fund Your Wallet</h2>
                      <p className="text-xs text-cream/50 mb-6 uppercase tracking-widest">Select Amount</p>
                      
                      <form onSubmit={handleFundAmountSubmit} className="space-y-4">
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
                          <Button fullWidth>Continue to Payment</Button>
                      </form>
                  </div>
              </div>
          ) : (
              <PaymentModal 
                amount={Number(fundAmount)}
                description="Wallet Funding"
                userId={currentUser.id}
                onSuccess={handleFundSuccess}
                onClose={() => { setFundModal(false); setFundStep('amount'); }}
              />
          )
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar */}
          <div className="w-full md:w-1/4">
            <div className="bg-[#1f0c05] border border-golden-orange/20 p-6 shadow-2xl relative text-center rounded-sm">
               <div className="w-20 h-20 bg-golden-orange rounded-full mx-auto mb-4 flex items-center justify-center text-espresso text-2xl font-serif font-bold border-4 border-[#1f0c05]">
                  {currentUser.name.charAt(0)}
               </div>
               <h2 className="font-serif text-xl text-cream">{currentUser.name}</h2>
               <div className="flex justify-center items-center gap-2 mt-2">
                   <span className={`text-[10px] px-2 py-0.5 uppercase tracking-widest border rounded ${currentUser.role === 'Partner' ? 'border-blue-400 text-blue-400' : 'border-golden-orange text-golden-orange'}`}>
                       {currentUser.role}
                   </span>
                   <span className={`text-[10px] px-2 py-0.5 uppercase tracking-widest border rounded ${currentUser.verificationStatus === 'Verified' ? 'border-green-400 text-green-400' : currentUser.verificationStatus === 'Rejected' ? 'border-red-400 text-red-400' : 'border-red-400 text-red-400'}`}>
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
                       <div className="flex gap-2">
                           <button onClick={() => setFundModal(true)} className="flex-1 bg-white/5 border border-white/10 text-cream py-2 text-xs uppercase font-bold hover:bg-white/10 transition-colors">Deposit</button>
                           <button onClick={() => setWithdrawModal(true)} className="flex-1 bg-white/5 border border-white/10 text-cream py-2 text-xs uppercase font-bold hover:bg-white/10 transition-colors">Withdraw</button>
                       </div>
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
                    <button onClick={() => setCurrentView('finances')} className={`w-full text-left px-4 py-3 border-l-2 transition-all ${currentView === 'finances' ? 'border-golden-orange bg-white/5 text-golden-orange' : 'border-transparent text-cream hover:bg-white/5'}`}>Financials</button>
                    <button onClick={() => setCurrentView('listings')} className={`w-full text-left px-4 py-3 border-l-2 transition-all ${currentView === 'listings' ? 'border-golden-orange bg-white/5 text-golden-orange' : 'border-transparent text-cream hover:bg-white/5'}`}>My Listings</button>
                    <button onClick={() => setCurrentView('add-item')} className={`w-full text-left px-4 py-3 border-l-2 transition-all ${currentView === 'add-item' ? 'border-golden-orange bg-white/5 text-golden-orange' : 'border-transparent text-cream hover:bg-white/5'}`}>Add New Item</button>
                    <button onClick={() => setCurrentView('orders')} className={`w-full text-left px-4 py-3 border-l-2 transition-all ${currentView === 'orders' ? 'border-golden-orange bg-white/5 text-golden-orange' : 'border-transparent text-cream hover:bg-white/5'}`}>Incoming Requests</button>
                  </>
              ) : (
                  <>
                    <button onClick={() => setCurrentView('overview')} className={`w-full text-left px-4 py-3 border-l-2 transition-all ${currentView === 'overview' ? 'border-golden-orange bg-white/5 text-golden-orange' : 'border-transparent text-cream hover:bg-white/5'}`}>Active Activity</button>
                    <button onClick={() => setCurrentView('history')} className={`w-full text-left px-4 py-3 border-l-2 transition-all ${currentView === 'history' ? 'border-golden-orange bg-white/5 text-golden-orange' : 'border-transparent text-cream hover:bg-white/5'}`}>Order History</button>
                    <button onClick={() => setCurrentView('finances')} className={`w-full text-left px-4 py-3 border-l-2 transition-all ${currentView === 'finances' ? 'border-golden-orange bg-white/5 text-golden-orange' : 'border-transparent text-cream hover:bg-white/5'}`}>Transactions</button>
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
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                     <div className="bg-white/5 p-6 border border-white/10">
                         <h3 className="text-cream/50 uppercase text-xs">Total Earnings</h3>
                         <p className="text-3xl text-golden-orange font-serif">${currentUser.walletBalance}</p>
                     </div>
                     <div className="bg-white/5 p-6 border border-white/10">
                         <h3 className="text-cream/50 uppercase text-xs">Active Listings</h3>
                         <p className="text-3xl text-cream font-serif">{myListings.length}</p>
                     </div>
                     <div className="bg-white/5 p-6 border border-white/10">
                         <h3 className="text-cream/50 uppercase text-xs">Verification</h3>
                         <p className={`text-xl font-serif ${currentUser.verificationStatus === 'Verified' ? 'text-green-400' : 'text-red-400'}`}>{currentUser.verificationStatus}</p>
                     </div>
                 </div>
             )}

             {/* ... Partner Finances, Add Item, Listings, Orders omitted for brevity as they are unchanged ... */}
             {currentUser.role === 'Partner' && currentView === 'finances' && (
                 <div>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-serif text-2xl text-cream">Financial History</h3>
                        <Button onClick={() => setWithdrawModal(true)} variant="secondary" className="text-xs">
                             <Banknote size={16} className="mr-2"/> Withdraw Funds
                        </Button>
                    </div>
                    
                    <div className="bg-[#1f0c05] border border-white/10 rounded-sm overflow-hidden">
                        <table className="w-full text-left text-sm text-cream/70">
                            <thead className="bg-white/5 uppercase text-xs tracking-wider text-golden-orange">
                                <tr>
                                    <th className="p-4">Date</th>
                                    <th className="p-4">Description</th>
                                    <th className="p-4">Type</th>
                                    <th className="p-4">Amount</th>
                                    <th className="p-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {userTransactions.map(tx => (
                                    <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4 text-xs text-cream/50">{tx.date}</td>
                                        <td className="p-4 font-medium text-cream">{tx.description}</td>
                                        <td className="p-4">
                                            <span className={`flex items-center gap-1 text-xs uppercase font-bold ${
                                                tx.type === 'Credit' ? 'text-green-400' : 
                                                tx.type === 'Debit' ? 'text-red-400' : 
                                                tx.type === 'Withdrawal' ? 'text-blue-400' : 'text-yellow-500'
                                            }`}>
                                                {tx.type === 'Credit' && <ArrowDownLeft size={12}/>}
                                                {tx.type === 'Withdrawal' && <ArrowUpRight size={12}/>}
                                                {tx.type}
                                            </span>
                                        </td>
                                        <td className="p-4 font-serif text-cream">${tx.amount.toLocaleString()}</td>
                                        <td className="p-4">
                                            <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${
                                                tx.status === 'Completed' ? 'bg-green-500/10 text-green-400' : 
                                                tx.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-red-500/10 text-red-400'
                                            }`}>
                                                {tx.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {userTransactions.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-cream/50 italic">No transactions found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                 </div>
             )}

             {currentUser.role === 'Partner' && currentView === 'add-item' && (
                 <div className="bg-white/5 border border-white/10 p-8 rounded-sm">
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
                                    <p className="text-xs text-cream/40 mb-2">Automatically convert to 'For Sale' after this many rentals (Default 5).</p>
                                    <input disabled type="number" placeholder="5" value="5" className="w-full bg-black/20 border border-white/10 p-3 text-cream/50 focus:border-golden-orange outline-none cursor-not-allowed" />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs text-cream/50 mb-2 block uppercase font-bold tracking-wider">Product Gallery</label>
                                <div className="border-2 border-dashed border-white/10 p-8 text-center cursor-pointer relative hover:border-golden-orange/50 hover:bg-white/5 transition-all group rounded-sm">
                                    <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" id="img-upload" />
                                    <div className="pointer-events-none flex flex-col items-center">
                                        <div className="bg-black/40 p-3 rounded-full mb-3 group-hover:scale-105 transition-transform">
                                            <ImageIcon className="text-cream/50" size={24} />
                                        </div>
                                        <p className="text-cream text-sm font-bold mb-1">Click to Upload Images</p>
                                        <p className="text-cream/40 text-xs">Support multiple files (JPG, PNG)</p>
                                    </div>
                                </div>
                                
                                {newItem.images && newItem.images.length > 0 && (
                                    <div className="mt-4">
                                        <p className="text-[10px] text-cream/40 uppercase mb-2">Uploaded ({newItem.images.length})</p>
                                        <div className="flex flex-wrap gap-3">
                                            {newItem.images.map((src, idx) => (
                                                <div key={idx} className="relative group w-24 h-24 rounded-sm overflow-hidden border border-white/10">
                                                    <img src={src} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt="Preview"/>
                                                    <button 
                                                        type="button" 
                                                        onClick={() => removeImage(idx)} 
                                                        className="absolute top-1 right-1 bg-red-500/90 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                                        title="Remove Image"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <Button fullWidth type="submit">Publish Listing (Global Visibility)</Button>
                         </form>
                     )}
                 </div>
             )}

             {currentUser.role === 'Partner' && currentView === 'listings' && (
                 <div className="space-y-4">
                     <h3 className="font-serif text-2xl text-cream mb-6">My Inventory</h3>
                     {myListings.length === 0 ? <p className="text-cream/50">No items listed.</p> : myListings.map(item => (
                         <div key={item.id} className="bg-white/5 p-4 flex gap-4 border border-white/10 rounded-sm">
                             <img src={item.images[0]} className="w-24 h-32 object-cover rounded-sm" />
                             <div className="flex-grow">
                                 <div className="flex justify-between items-start">
                                     <div>
                                        <h4 className="text-cream font-bold text-lg">{item.name}</h4>
                                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ml-2 ${item.isAvailable !== false ? 'border-green-500/30 text-green-400 bg-green-500/10' : 'border-red-500/30 text-red-400 bg-red-500/10'}`}>
                                            {item.isAvailable !== false ? 'Available' : 'Out of Order'}
                                        </span>
                                     </div>
                                     <button 
                                        onClick={() => handleToggleAvailability(item)}
                                        className={`text-xs px-3 py-1 rounded transition-colors ${item.isAvailable !== false ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'}`}
                                     >
                                         {item.isAvailable !== false ? 'Mark Out of Order' : 'Mark Available'}
                                     </button>
                                 </div>
                                 <div className="flex flex-wrap gap-4 text-sm text-cream/70 mt-1">
                                     <span>Rent: ${item.rentalPrice}</span>
                                     {item.isForSale && <span>Buy: ${item.buyPrice}</span>}
                                 </div>
                                 <div className="flex items-center gap-4 mt-2">
                                    <span className="text-xs text-cream/50 bg-black/20 px-2 py-1 rounded">Rentals: {item.rentalCount || 0}/5</span>
                                    {item.rentalCount && item.rentalCount >= 5 && <span className="text-xs text-red-400 bg-red-900/10 px-2 py-1 rounded border border-red-500/30">Max Rentals Reached - Sell Only</span>}
                                 </div>
                                 <div className="flex gap-2 mt-4">
                                     <button className="text-xs border border-white/20 px-3 py-1 text-cream hover:border-golden-orange rounded-sm">Edit</button>
                                     <button onClick={() => handleRemoveItem(item.id)} className="text-xs border border-red-500/20 px-3 py-1 text-red-400 hover:bg-red-500/10 flex items-center gap-1 rounded-sm"><Trash2 size={12}/> Remove</button>
                                 </div>
                             </div>
                         </div>
                     ))}
                 </div>
             )}

            {currentUser.role === 'Partner' && currentView === 'orders' && (
                 <div className="space-y-4">
                     <h3 className="font-serif text-2xl text-cream mb-6">Incoming Requests</h3>
                     {partnerOrders.length === 0 ? <p className="text-cream/50">No requests yet.</p> : partnerOrders.map(order => {
                         // Filter to only show items owned by this partner
                         const myItems = order.items.filter(i => i.product.ownerId === currentUser.id);
                         if (myItems.length === 0) return null;

                         return (
                             <div key={order.id} className="bg-white/5 p-6 border border-white/10 mb-6 rounded-sm">
                                 {/* ... existing order rendering ... */}
                                 <div className="flex justify-between items-start mb-4 border-b border-white/5 pb-2">
                                     <div>
                                         <p className="text-xs text-cream/40 uppercase">Order ID: {order.id}</p>
                                         <p className="text-cream font-bold">Renter: {order.userName}</p>
                                     </div>
                                     <span className="text-xs text-cream/50">{order.date}</span>
                                 </div>
                                 
                                 {myItems.map((item, idx) => (
                                     <div key={idx} className="flex flex-col md:flex-row gap-4 mb-4 bg-black/20 p-4 border border-white/5 rounded-sm">
                                         <img src={item.product.images[0]} className="w-16 h-20 object-cover rounded-sm" />
                                         <div className="flex-grow">
                                             <p className="text-cream font-bold">{item.product.name}</p>
                                             <div className="flex gap-4 text-xs text-cream/60 mt-1">
                                                 <span>Size: {item.selectedSize}</span>
                                                 <span>Type: <span className="text-golden-orange uppercase">{item.type}</span></span>
                                                 {item.duration && <span>Duration: {item.duration} Days</span>}
                                             </div>
                                             <p className="text-lg font-serif text-golden-orange mt-2">${item.price}</p>
                                             
                                             {/* Logistics Details View for Partner */}
                                             {item.delivery && (
                                                <div className="mt-3 bg-white/5 p-2 rounded text-xs border-l-2 border-golden-orange">
                                                    <p className="text-golden-orange font-bold uppercase mb-1">Logistics Assigned</p>
                                                    <p className="text-cream/70">Provider: {item.delivery.courier}</p>
                                                    <p className="text-cream/70">Rider: {item.delivery.riderName} ({item.delivery.riderPhone})</p>
                                                    <p className="text-cream/50 italic mt-1">Status: En Route to Customer</p>
                                                </div>
                                             )}
                                         </div>
                                         <div className="flex flex-col items-end justify-center min-w-[150px]">
                                             <div className="mb-2">
                                                 <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${item.status === 'Pending Approval' ? 'bg-yellow-500/10 text-yellow-500' : item.status === 'Accepted' || item.status === 'Shipped' || item.status === 'Delivered' ? 'bg-green-500/10 text-green-500' : item.status === 'Completed' ? 'bg-blue-500/10 text-blue-400' : item.status === 'Returned' ? 'bg-purple-500/10 text-purple-400' : 'bg-red-500/10 text-red-500'}`}>
                                                     {item.status}
                                                 </span>
                                             </div>
                                             
                                             {item.status === 'Pending Approval' && (
                                                 <div className="flex gap-2">
                                                     <button onClick={() => handleAcceptItem(order.id, item.id, item.product.id, item.price)} className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 text-xs rounded transition-colors">Accept & Credit</button>
                                                     <button onClick={() => handleRejectItem(order.id, item.id)} className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 text-xs rounded transition-colors">Decline</button>
                                                 </div>
                                             )}

                                             {item.status === 'Accepted' && (
                                                 <button 
                                                    onClick={() => openDispatchModal(order.id, item.id, item.product.name)}
                                                    className="bg-golden-orange hover:bg-white text-espresso px-3 py-1 text-xs rounded transition-colors font-bold flex items-center gap-1"
                                                 >
                                                     <Truck size={12}/> Dispatch Item
                                                 </button>
                                             )}

                                             {item.status === 'Returned' && (
                                                 <button 
                                                    onClick={() => handlePartnerConfirmReturn(order.id, item.id)}
                                                    className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-1 text-xs rounded transition-colors font-bold flex items-center gap-1"
                                                 >
                                                     <Check size={12}/> Confirm Return
                                                 </button>
                                             )}
                                         </div>
                                     </div>
                                 ))}
                             </div>
                         );
                     })}
                 </div>
             )}

             {/* --- USER VIEWS --- */}
             {currentUser.role === 'User' && currentView === 'overview' && (
                 <div className="pt-2">
                     <div className="flex justify-between items-end mb-6">
                        <h3 className="font-serif text-2xl text-cream">Current Overview</h3>
                        <span className="text-xs text-cream/50 uppercase tracking-widest">{new Date().toLocaleDateString()}</span>
                     </div>
                     
                     {/* Search History Section - NEW */}
                     {currentUser.searchHistory && currentUser.searchHistory.length > 0 && (
                         <div className="mb-8 p-4 border border-white/5 bg-white/5 rounded-sm">
                             <h4 className="text-xs uppercase text-cream/50 mb-3 flex items-center gap-2"><Search size={14}/> Recent Interests</h4>
                             <div className="flex flex-wrap gap-2">
                                 {currentUser.searchHistory.map((term, idx) => (
                                     <Link to="/catalog" key={idx} className="bg-black/30 hover:bg-golden-orange/20 text-cream/80 hover:text-golden-orange px-3 py-1 rounded-full text-sm border border-white/10 transition-colors">
                                         {term}
                                     </Link>
                                 ))}
                             </div>
                         </div>
                     )}

                     {currentUser.verificationStatus === 'Verified' && (
                         <div className="bg-green-500/10 border border-green-500/30 p-6 mb-8 flex items-start md:items-center gap-4 rounded-sm shadow-lg relative overflow-hidden animate-fade-in">
                             <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                                <ShieldCheck size={64} />
                             </div>
                             <div className="bg-green-500 text-espresso p-2 rounded-full shrink-0 relative z-10">
                                <Check size={20}/>
                             </div>
                             <div className="relative z-10">
                                 <h4 className="text-green-400 font-bold text-base uppercase tracking-wide mb-1">Account Verified</h4>
                                 <p className="text-cream/70 text-sm">Your identity has been confirmed. You now have unrestricted access to the Stylus Vault.</p>
                             </div>
                         </div>
                     )}

                     {currentUser.verificationStatus === 'Rejected' && (
                         <div className="bg-red-500/10 border border-red-500/30 p-6 mb-8 flex items-start gap-4 rounded-sm shadow-lg relative overflow-hidden animate-fade-in">
                             <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                                <AlertCircle size={64} />
                             </div>
                             <div className="bg-red-500 text-white p-2 rounded-full shrink-0 relative z-10">
                                <X size={20}/>
                             </div>
                             <div className="relative z-10 w-full">
                                 <h4 className="text-red-400 font-bold text-base uppercase tracking-wide mb-1">Verification Rejected</h4>
                                 <p className="text-cream/70 text-sm mb-3">Admin Note: "{currentUser.adminNotes || 'No specific reason provided'}"</p>
                                 <button 
                                    onClick={() => setVerificationModal(true)}
                                    className="bg-red-500 text-white px-4 py-2 text-xs uppercase font-bold rounded-sm hover:bg-red-600 transition-colors"
                                 >
                                     Resubmit Documents
                                 </button>
                             </div>
                         </div>
                     )}
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                         <div className="bg-[#1f0c05] border border-white/10 p-6 relative overflow-hidden rounded-sm shadow-md group hover:border-golden-orange/30 transition-colors">
                             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><ShoppingBag size={64}/></div>
                             <h4 className="text-cream font-bold text-lg mb-1">Active Requests</h4>
                             <p className="text-3xl font-serif text-golden-orange">{activeOrders.length}</p>
                             <p className="text-xs text-cream/50 mt-2">Items currently in processing or rented.</p>
                         </div>
                         <div className="bg-[#1f0c05] border border-white/10 p-6 relative overflow-hidden rounded-sm shadow-md group hover:border-golden-orange/30 transition-colors">
                             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><History size={64}/></div>
                             <h4 className="text-cream font-bold text-lg mb-1">Total History</h4>
                             <p className="text-3xl font-serif text-cream">{pastOrders.length}</p>
                             <p className="text-xs text-cream/50 mt-2">Completed orders (Returned or Purchased).</p>
                         </div>
                     </div>

                     <h4 className="font-serif text-xl text-cream mb-4 border-b border-white/10 pb-2">Active Engagements</h4>
                     {activeOrders.length === 0 ? <p className="text-cream/50 italic py-4">No active rentals or purchases pending.</p> : (
                         <div className="grid gap-4">
                             {activeOrders.map(o => (
                                 <div key={o.id} className="bg-white/5 p-4 border border-white/10 flex flex-col sm:flex-row gap-4 rounded-sm">
                                     <div className="flex-1">
                                        <div className="flex justify-between mb-2">
                                            <span className="text-golden-orange font-bold">Order {o.id}</span>
                                            <span className="text-xs text-cream/40">{o.date}</span>
                                        </div>
                                        
                                        <div className="space-y-3">
                                            {o.items.map(i => (
                                                <div key={i.id} className="flex gap-3 bg-black/20 p-2 rounded relative overflow-hidden flex-col md:flex-row">
                                                    <div className="flex gap-3 flex-1">
                                                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${i.status === 'Accepted' || i.status === 'Shipped' || i.status === 'Delivered' ? 'bg-green-500' : i.status === 'Rejected' ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                                                        <img src={i.product.images[0]} className="w-12 h-16 object-cover ml-2 rounded-sm" />
                                                        <div className="flex-grow">
                                                            <div className="flex justify-between">
                                                                <p className="text-sm text-cream font-bold">{i.product.name}</p>
                                                                <span className={`text-[10px] uppercase font-bold ${i.status === 'Accepted' || i.status === 'Shipped' || i.status === 'Delivered' ? 'text-green-400' : i.status === 'Rejected' ? 'text-red-400' : 'text-yellow-400'}`}>{i.status}</span>
                                                            </div>
                                                            <p className="text-xs text-golden-orange">{i.type === 'buy' ? 'Purchase' : `Rent (${i.duration} Days)`}</p>
                                                            
                                                            <OrderTimeline status={i.status} type={i.type} />

                                                            {i.type === 'rent' && i.endDate && (
                                                                <p className="text-[10px] text-cream/50 flex items-center gap-1 mt-1"><Clock size={10}/> Return by: {i.endDate}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Tracking Info for User */}
                                                    {i.delivery && (
                                                        <div className="bg-[#1f0c05] border border-white/10 p-3 rounded w-full md:w-64 text-xs">
                                                            <div className="flex items-center gap-2 text-golden-orange font-bold mb-1 uppercase tracking-wider">
                                                                <Truck size={12}/> Tracking Updates
                                                            </div>
                                                            <div className="space-y-1 text-cream/70 mb-2">
                                                                <p>Courier: <span className="text-white">{i.delivery.courier}</span></p>
                                                                <p>Rider: {i.delivery.riderName}</p>
                                                                <p className="flex items-center gap-1"><Phone size={10}/> {i.delivery.riderPhone}</p>
                                                            </div>
                                                            
                                                            {i.status === 'Shipped' && (
                                                                <button 
                                                                    onClick={() => handleUserReceiveItem(o.id, i.id, i.type)}
                                                                    className="w-full mt-1 bg-green-600 hover:bg-green-500 text-white py-2 rounded font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1"
                                                                >
                                                                    <Check size={12}/> Confirm Receipt
                                                                </button>
                                                            )}

                                                            {i.status === 'Delivered' && i.type === 'rent' && (
                                                                <button 
                                                                    onClick={() => handleReturnItem(o.id, i.id)}
                                                                    className="w-full mt-1 bg-purple-600 hover:bg-purple-500 text-white py-2 rounded font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1"
                                                                >
                                                                    <RotateCcw size={12}/> Return Item
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                     </div>
                                 </div>
                             ))}
                         </div>
                     )}
                 </div>
             )}

             {/* ... remaining sections ... */}
             {currentUser.role === 'User' && currentView === 'history' && (
                 <div>
                     <h3 className="font-serif text-2xl text-cream mb-6">Order History</h3>
                     {pastOrders.length === 0 ? <div className="bg-white/5 p-8 text-center rounded-sm"><p className="text-cream/50">No historical data found.</p></div> : (
                         <div className="space-y-4">
                             {pastOrders.map(o => (
                                 <div key={o.id} className="bg-white/5 border border-white/5 rounded-sm p-6 hover:border-golden-orange/30 transition-colors">
                                     <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 pb-4 border-b border-white/5 gap-4">
                                         <div>
                                             <div className="flex items-center gap-3">
                                                <span className="text-lg font-bold text-cream">Order {o.id}</span>
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
                                                     <p className="text-[10px] mt-1 text-cream/50">{item.status}</p>
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
             
             {currentUser.role === 'User' && currentView === 'finances' && (
                 <div>
                    <h3 className="font-serif text-2xl text-cream mb-6">Transactions</h3>
                    <div className="bg-[#1f0c05] border border-white/10 rounded-sm overflow-hidden">
                        <table className="w-full text-left text-sm text-cream/70">
                            <thead className="bg-white/5 uppercase text-xs tracking-wider text-golden-orange">
                                <tr>
                                    <th className="p-4">Date</th>
                                    <th className="p-4">Description</th>
                                    <th className="p-4">Type</th>
                                    <th className="p-4">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {userTransactions.map(tx => (
                                    <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4 text-xs text-cream/50">{tx.date}</td>
                                        <td className="p-4 font-medium text-cream">{tx.description}</td>
                                        <td className="p-4">
                                            <span className={`flex items-center gap-1 text-xs uppercase font-bold ${
                                                tx.type === 'Credit' ? 'text-green-400' : 'text-red-400'
                                            }`}>
                                                {tx.type}
                                            </span>
                                        </td>
                                        <td className="p-4 font-serif text-cream">${tx.amount.toLocaleString()}</td>
                                    </tr>
                                ))}
                                {userTransactions.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-cream/50 italic">No transactions found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                 </div>
             )}

              {currentUser.role === 'User' && currentView === 'wishlist' && (
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     {wishlist.length === 0 ? <p className="text-cream/50">Wishlist is empty.</p> : wishlist.map(p => (
                         <div key={p.id} className="bg-white/5 p-4 border border-white/10 rounded-sm">
                             <img src={p.images[0]} className="w-full h-40 object-cover mb-4 rounded-sm" />
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
