
import React, { useState } from 'react';
import { 
  Check, Plus, Search, Trash2, ShieldCheck, Power, 
  AlertTriangle, Wallet, BarChart3, PieChart, Star, 
  Activity, TrendingUp, DollarSign, ArrowUp, X, 
  CheckCircle, XCircle, FileText, Eye, Building2, User 
} from 'lucide-react';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useProduct } from '../context/ProductContext';
import { useOrders } from '../context/OrderContext';
import { Category, Product } from '../types';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'rentals' | 'inventory' | 'marketing' | 'verifications' | 'global_activity' | 'financials'>('rentals');
  const [selectedDoc, setSelectedDoc] = useState<{ url: string, title: string } | null>(null);
  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const [userFilter, setUserFilter] = useState<'All' | 'User' | 'Partner'>('All');
  
  // Destructure with robust safety defaults to prevent blank screens
  const auth = useAuth();
  const { 
    logout, 
    registeredUsers: contextUsers, 
    deleteUser, 
    approveVerification, 
    rejectVerification, 
    updateUserStatus,
    transactions: contextTransactions,
    processWithdrawal
  } = auth || {};

  const registeredUsers = contextUsers || [];
  const transactions = contextTransactions || [];
  
  const productContext = useProduct();
  const { products: contextProducts, removeProduct, addProduct } = productContext || {};
  const products = contextProducts || [];

  const orderContext = useOrders();
  const { orders: contextOrders, updateOrderItemStatus } = orderContext || {};
  const orders = contextOrders || [];
  
  const navigate = useNavigate();

  // Robust filtering
  const pendingVerifications = registeredUsers.filter(u => u && u.verificationStatus === 'Pending');

  // New Item State for Admin Add Stock
  const [newItem, setNewItem] = useState<Partial<Product>>({
    name: '', brand: '', category: Category.WOMEN, rentalPrice: 0, retailPrice: 0, buyPrice: 0, isForSale: false, description: '', availableSizes: [], images: [], color: '', occasion: '', autoSellAfterRentals: 0
  });
  const [sizeInput, setSizeInput] = useState('');

  // Filter for User Management
  const filteredUsers = registeredUsers.filter(u => {
      if (userFilter === 'All') return true;
      return u?.role === userFilter;
  });

  const handleLogout = () => { 
      if (logout) logout(); 
      navigate('/login'); 
  };

  const handleSuspendToggle = (userId: string, currentStatus: string) => {
      const newStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
      const reason = newStatus === 'Suspended' ? prompt("Enter reason for suspension:") : undefined;
      if (newStatus === 'Suspended' && !reason) return; // Cancel if no reason provided
      
      if (updateUserStatus) updateUserStatus(userId, newStatus, reason || undefined);
  };

  const handleDeleteUser = (userId: string) => {
      if(confirm("Are you sure you want to PERMANENTLY DELETE this user? This action cannot be undone.")) {
          if (deleteUser) deleteUser(userId);
      }
  };
  
  const handleApprove = (userId: string, userName: string) => {
      if(confirm(`Approve verification for ${userName}?`)) {
        if (approveVerification) approveVerification(userId);
      }
  };

  const handleReject = (userId: string) => {
      const reason = prompt("Please provide a reason for rejection (this will be sent to the user):", "Document ID number did not match upload.");
      if (reason) {
          if (rejectVerification) rejectVerification(userId, reason);
          alert("User rejected and notified.");
      }
  };

  const handleManualVerify = (userId: string, userName: string) => {
      if(confirm(`FORCE VERIFY: Are you sure you want to manually verify ${userName} without waiting for document submission?`)) {
          if (approveVerification) approveVerification(userId);
      }
  }

  const handleExportUsers = () => {
      const headers = ["ID", "Name", "Email", "Role", "Status", "Joined", "Verification"];
      const rows = filteredUsers.map(u => [
          u.id, 
          u.name, 
          u.email, 
          u.role, 
          u.status, 
          u.joined,
          u.verificationStatus
      ]);
      
      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `stylus_users_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const handleDeleteProduct = (id: string) => {
      if(confirm("Are you sure you want to delete this product from the global inventory?")) {
          if (removeProduct) removeProduct(id);
      }
  };
  
  const handleForceStatus = (orderId: string, itemId: string, status: any) => {
      if(confirm(`Are you sure you want to FORCE update this transaction to '${status}'? This overrides partner control.`)) {
          if (updateOrderItemStatus) updateOrderItemStatus(orderId, itemId, status);
      }
  };
  
  const handleProcessWithdrawal = (txId: string) => {
      if(confirm("Confirm that you have transferred funds to the partner's bank account?")) {
          if (processWithdrawal) processWithdrawal(txId);
          alert("Withdrawal marked as completed.");
      }
  }

  const handleAddStockSubmit = (e: React.FormEvent) => {
      e.preventDefault();
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
        ownerId: 'stylus-official', // Admin adds as Official
        description: newItem.description || '',
        images: newItem.images && newItem.images.length > 0 ? newItem.images : ['https://images.unsplash.com/photo-1549439602-43ebca2327af?q=80&w=1000&auto=format&fit=crop'],
        availableSizes: sizeInput.split(',').map(s => s.trim()).filter(s => s),
        color: newItem.color || 'Multi',
        occasion: newItem.occasion || 'General',
        reviews: [],
        rentalCount: 0
    };
    if (addProduct) addProduct(product);
    setShowAddStockModal(false);
    setNewItem({ name: '', brand: '', category: Category.WOMEN, rentalPrice: 0, retailPrice: 0, buyPrice: 0, isForSale: false, description: '', availableSizes: [], images: [], color: '', occasion: '', autoSellAfterRentals: 0 });
    setSizeInput('');
    alert("Item added to global inventory.");
  };

  // Mock Data for Charts
  const categoryData = [
      { name: 'Women', value: 45, color: '#e1af4d' }, // Golden Orange
      { name: 'Men', value: 25, color: '#ebc35b' },   // Golden Light
      { name: 'Bags', value: 20, color: '#f9edd2' },   // Cream
      { name: 'Watches', value: 10, color: '#854d0e' } // Darker Gold/Brown
  ];

  // Helper to create conic gradient string
  const getConicGradient = () => {
      let currentDeg = 0;
      return `conic-gradient(${categoryData.map(d => {
          const deg = (d.value / 100) * 360;
          const str = `${d.color} ${currentDeg}deg ${currentDeg + deg}deg`;
          currentDeg += deg;
          return str;
      }).join(', ')})`;
  };

  if (!auth) return <div className="min-h-screen bg-espresso flex items-center justify-center text-cream">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-espresso pt-8 pb-20 animate-fade-in relative">
        {/* Document Viewer Modal */}
        {selectedDoc && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4" onClick={() => setSelectedDoc(null)}>
                <div className="max-w-4xl w-full bg-[#1f0c05] border border-golden-orange p-4 relative" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
                        <h3 className="text-cream font-serif text-xl">{selectedDoc.title}</h3>
                        <button onClick={() => setSelectedDoc(null)} className="text-cream/50 hover:text-white"><X/></button>
                    </div>
                    <div className="h-[600px] w-full bg-black/50 flex items-center justify-center overflow-hidden">
                        <img src={selectedDoc.url} alt="Document" className="max-h-full max-w-full object-contain" />
                    </div>
                </div>
            </div>
        )}

        {/* Add Stock Modal */}
        {showAddStockModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
                <div className="bg-[#1f0c05] border border-golden-orange w-full max-w-2xl p-8 relative rounded-sm my-8">
                     <button onClick={() => setShowAddStockModal(false)} className="absolute top-4 right-4 text-cream/50 hover:text-golden-orange"><X size={24}/></button>
                     <h2 className="font-serif text-2xl text-cream mb-6">Add Global Inventory</h2>
                     <form onSubmit={handleAddStockSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-cream/50 mb-1 block">Item Name</label>
                                <input required placeholder="e.g. Royal Silk Gown" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} className="w-full bg-black/20 border border-white/10 p-3 text-cream focus:border-golden-orange outline-none" />
                            </div>
                            <div>
                                <label className="text-xs text-cream/50 mb-1 block">Brand</label>
                                <input required placeholder="e.g. Gucci" value={newItem.brand} onChange={e => setNewItem({...newItem, brand: e.target.value})} className="w-full bg-black/20 border border-white/10 p-3 text-cream focus:border-golden-orange outline-none" />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="text-xs text-cream/50 mb-1 block">Category</label>
                                <select 
                                    value={newItem.category}
                                    onChange={(e) => setNewItem({...newItem, category: e.target.value as Category})}
                                    className="w-full bg-black/20 border border-white/10 p-3 text-cream focus:border-golden-orange outline-none"
                                >
                                    {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-cream/50 mb-1 block">Rent Price ($)</label>
                                <input required type="number" value={newItem.rentalPrice || ''} onChange={e => setNewItem({...newItem, rentalPrice: Number(e.target.value)})} className="w-full bg-black/20 border border-white/10 p-3 text-cream focus:border-golden-orange outline-none" />
                            </div>
                            <div>
                                <label className="text-xs text-cream/50 mb-1 block">Retail Price ($)</label>
                                <input required type="number" value={newItem.retailPrice || ''} onChange={e => setNewItem({...newItem, retailPrice: Number(e.target.value)})} className="w-full bg-black/20 border border-white/10 p-3 text-cream focus:border-golden-orange outline-none" />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs text-cream/50 mb-1 block">Available Sizes (Comma separated)</label>
                            <input required placeholder="S, M, L, XL" value={sizeInput} onChange={e => setSizeInput(e.target.value)} className="w-full bg-black/20 border border-white/10 p-3 text-cream focus:border-golden-orange outline-none" />
                        </div>
                        <div>
                            <label className="text-xs text-cream/50 mb-1 block">Description</label>
                            <textarea required rows={3} value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} className="w-full bg-black/20 border border-white/10 p-3 text-cream focus:border-golden-orange outline-none" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="text-xs text-cream/50 mb-1 block">Color</label>
                                <input required value={newItem.color} onChange={e => setNewItem({...newItem, color: e.target.value})} className="w-full bg-black/20 border border-white/10 p-3 text-cream focus:border-golden-orange outline-none" />
                            </div>
                             <div>
                                <label className="text-xs text-cream/50 mb-1 block">Occasion</label>
                                <input required value={newItem.occasion} onChange={e => setNewItem({...newItem, occasion: e.target.value})} className="w-full bg-black/20 border border-white/10 p-3 text-cream focus:border-golden-orange outline-none" />
                            </div>
                        </div>
                         <div className="flex items-center gap-2 pt-2">
                             <input type="checkbox" checked={newItem.isForSale} onChange={e => setNewItem({...newItem, isForSale: e.target.checked})} className="accent-golden-orange w-4 h-4" />
                             <label className="text-sm text-cream">Available for Purchase?</label>
                         </div>
                         {newItem.isForSale && (
                             <div>
                                 <label className="text-xs text-cream/50 mb-1 block">Buy Price ($)</label>
                                 <input type="number" value={newItem.buyPrice || ''} onChange={e => setNewItem({...newItem, buyPrice: Number(e.target.value)})} className="w-full bg-black/20 border border-white/10 p-3 text-cream focus:border-golden-orange outline-none" />
                             </div>
                         )}
                        <Button fullWidth type="submit" className="mt-4">Add Item to Inventory</Button>
                     </form>
                </div>
            </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-white/10 pb-6">
                <div>
                    <h1 className="font-serif text-4xl text-cream mt-2">Executive Dashboard</h1>
                    <p className="text-golden-orange text-xs uppercase tracking-widest mt-1">Admin Control Panel</p>
                </div>
                <div className="flex gap-2 flex-wrap mt-4 md:mt-0">
                    <button onClick={() => setActiveTab('users')} className={`px-4 py-2 rounded text-sm transition-colors ${activeTab === 'users' ? 'bg-golden-orange text-espresso font-bold' : 'text-cream hover:bg-white/5'}`}>Users</button>
                    <button onClick={() => setActiveTab('global_activity')} className={`px-4 py-2 rounded text-sm transition-colors ${activeTab === 'global_activity' ? 'bg-golden-orange text-espresso font-bold' : 'text-cream hover:bg-white/5'}`}>Activity</button>
                    <button onClick={() => setActiveTab('financials')} className={`px-4 py-2 rounded text-sm transition-colors ${activeTab === 'financials' ? 'bg-golden-orange text-espresso font-bold' : 'text-cream hover:bg-white/5'}`}>Financials</button>
                    <button onClick={() => setActiveTab('rentals')} className={`px-4 py-2 rounded text-sm transition-colors ${activeTab === 'rentals' ? 'bg-golden-orange text-espresso font-bold' : 'text-cream hover:bg-white/5'}`}>Analytics</button>
                    <button onClick={() => setActiveTab('inventory')} className={`px-4 py-2 rounded text-sm transition-colors ${activeTab === 'inventory' ? 'bg-golden-orange text-espresso font-bold' : 'text-cream hover:bg-white/5'}`}>Inventory</button>
                     <button onClick={() => setActiveTab('marketing')} className={`px-4 py-2 rounded text-sm transition-colors ${activeTab === 'marketing' ? 'bg-golden-orange text-espresso font-bold' : 'text-cream hover:bg-white/5'}`}>Marketing</button>
                    
                    {/* Verifications Tab with Pulsing Notification */}
                    <button 
                        onClick={() => setActiveTab('verifications')} 
                        className={`px-4 py-2 rounded text-sm relative transition-colors ${
                            activeTab === 'verifications' 
                                ? 'bg-golden-orange text-espresso font-bold' 
                                : pendingVerifications.length > 0 ? 'bg-red-600/20 text-red-400 border border-red-500/50 hover:bg-red-600/30' : 'text-cream hover:bg-white/5'
                        }`}
                    >
                        Verify
                        {pendingVerifications.length > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] min-w-[20px] h-5 rounded-full flex items-center justify-center animate-bounce shadow-lg border border-espresso">
                                {pendingVerifications.length}
                            </span>
                        )}
                    </button>
                    
                    <Button variant="outline" onClick={handleLogout} className="text-xs h-9 ml-2">Sign Out</Button>
                </div>
            </div>

            {/* 1. USER MANAGEMENT TAB */}
            {activeTab === 'users' && (
                <div className="animate-fade-in">
                     <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                        <h2 className="font-serif text-2xl text-cream">User Management</h2>
                        <div className="flex gap-2 items-center flex-wrap">
                             <div className="bg-black/20 p-1 rounded border border-white/10 flex">
                                 <button onClick={() => setUserFilter('All')} className={`px-3 py-1 text-xs uppercase rounded ${userFilter === 'All' ? 'bg-golden-orange text-espresso font-bold' : 'text-cream/50'}`}>All</button>
                                 <button onClick={() => setUserFilter('User')} className={`px-3 py-1 text-xs uppercase rounded ${userFilter === 'User' ? 'bg-golden-orange text-espresso font-bold' : 'text-cream/50'}`}>Users</button>
                                 <button onClick={() => setUserFilter('Partner')} className={`px-3 py-1 text-xs uppercase rounded ${userFilter === 'Partner' ? 'bg-golden-orange text-espresso font-bold' : 'text-cream/50'}`}>Partners</button>
                             </div>
                             <div className="relative">
                                 <Search className="absolute left-3 top-2.5 text-cream/30" size={16}/>
                                 <input type="text" placeholder="Search Users..." className="bg-black/20 border border-white/10 pl-10 pr-4 py-2 text-sm text-cream focus:border-golden-orange outline-none rounded-sm" />
                             </div>
                             <Button onClick={handleExportUsers} className="text-xs h-9 flex items-center gap-2">
                                <FileText size={14}/> Export CSV
                             </Button>
                        </div>
                     </div>
                     
                     {/* Demographics Summary */}
                     <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-[#1f0c05] p-4 border border-white/10">
                            <p className="text-xs text-cream/50 uppercase">Total Users</p>
                            <p className="text-2xl font-serif text-cream">{registeredUsers.length}</p>
                        </div>
                         <div className="bg-[#1f0c05] p-4 border border-white/10">
                            <p className="text-xs text-cream/50 uppercase">Verified</p>
                            <p className="text-2xl font-serif text-green-400">{registeredUsers.filter(u => u.verificationStatus === 'Verified').length}</p>
                        </div>
                         <div className="bg-[#1f0c05] p-4 border border-white/10">
                            <p className="text-xs text-cream/50 uppercase">Partners</p>
                            <p className="text-2xl font-serif text-blue-400">{registeredUsers.filter(u => u.role === 'Partner').length}</p>
                        </div>
                        <div className="bg-[#1f0c05] p-4 border border-white/10">
                            <p className="text-xs text-cream/50 uppercase">Suspended</p>
                            <p className="text-2xl font-serif text-red-500">{registeredUsers.filter(u => u.status === 'Suspended').length}</p>
                        </div>
                     </div>

                     <div className="overflow-x-auto bg-[#1f0c05] border border-white/10 rounded-sm">
                        <table className="w-full text-left text-sm text-cream/70">
                            <thead className="bg-white/5 uppercase text-xs tracking-wider text-golden-orange">
                                <tr>
                                    <th className="p-4">User</th>
                                    <th className="p-4">Role</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Verification</th>
                                    <th className="p-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredUsers.map(u => (
                                    <tr key={u.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4 font-bold text-white">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-golden-orange/20 flex items-center justify-center text-golden-orange text-xs">{u.name.charAt(0)}</div>
                                                <div>{u.name}<br/><span className="text-xs text-cream/40 font-normal">{u.email}</span></div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`text-[10px] px-2 py-0.5 rounded border uppercase tracking-wide font-bold ${u.role === 'Partner' ? 'border-blue-400 text-blue-400' : 'border-golden-orange text-golden-orange'}`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold ${u.status === 'Active' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                                {u.status}
                                            </span>
                                            {u.status === 'Suspended' && u.suspensionReason && (
                                                <div className="text-[10px] text-red-300 mt-1 max-w-[150px] truncate" title={u.suspensionReason}>
                                                    Reason: {u.suspensionReason}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4">
                                             <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold border ${u.verificationStatus === 'Verified' ? 'border-green-500/30 text-green-400' : u.verificationStatus === 'Pending' ? 'border-yellow-500/30 text-yellow-500' : 'border-white/10 text-cream/40'}`}>
                                                {u.verificationStatus}
                                             </span>
                                        </td>
                                        <td className="p-4 flex gap-2">
                                            {/* Verification Controls */}
                                            {u.verificationStatus === 'Pending' && (
                                                <>
                                                    <button onClick={() => handleApprove(u.id, u.name)} className="p-2 rounded border border-green-500/50 text-green-500 hover:bg-green-500/10" title="Approve Verification">
                                                        <CheckCircle size={14} />
                                                    </button>
                                                    <button onClick={() => handleReject(u.id)} className="p-2 rounded border border-red-500/50 text-red-500 hover:bg-red-500/10" title="Reject Verification">
                                                        <XCircle size={14} />
                                                    </button>
                                                </>
                                            )}
                                            {u.verificationStatus === 'Unverified' && (
                                                <button onClick={() => handleManualVerify(u.id, u.name)} className="p-2 rounded border border-blue-500/50 text-blue-500 hover:bg-blue-500/10" title="Force Manual Verify (Override)">
                                                    <ShieldCheck size={14} />
                                                </button>
                                            )}
                                            
                                            {/* Account Controls */}
                                            <button 
                                                onClick={() => handleSuspendToggle(u.id, u.status)}
                                                className={`p-2 rounded border transition-colors ${u.status === 'Active' ? 'border-yellow-600/50 text-yellow-500 hover:bg-yellow-600/10' : 'border-green-600/50 text-green-500 hover:bg-green-600/10'}`}
                                                title={u.status === 'Active' ? 'Suspend User' : 'Activate User'}
                                            >
                                                <Power size={14} />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteUser(u.id)}
                                                className="p-2 rounded border border-red-600/50 text-red-500 hover:bg-red-600/10 transition-colors"
                                                title="Delete User"
                                            >
                                                <Trash2 size={14}/>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                     </div>
                </div>
            )}
            
            {/* FINANCIALS TAB */}
            {activeTab === 'financials' && (
                <div className="animate-fade-in">
                    <h2 className="font-serif text-2xl text-cream mb-6">Financial Operations</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        {/* Pending Withdrawals */}
                        <div className="bg-[#1f0c05] border border-white/10 p-6 rounded-sm shadow-xl">
                            <h3 className="font-serif text-lg text-cream mb-4 flex items-center gap-2">
                                <AlertTriangle size={18} className="text-yellow-500"/> Pending Withdrawals
                            </h3>
                            {transactions.filter(t => t.type === 'Withdrawal' && t.status === 'Pending').length === 0 ? (
                                <p className="text-cream/50 italic text-sm">No pending requests.</p>
                            ) : (
                                <div className="space-y-4">
                                    {transactions.filter(t => t.type === 'Withdrawal' && t.status === 'Pending').map(tx => (
                                        <div key={tx.id} className="bg-white/5 p-4 border border-white/5 flex flex-col md:flex-row justify-between gap-4">
                                            <div>
                                                <p className="font-bold text-cream">{tx.userName}</p>
                                                <p className="text-xs text-cream/50 font-mono">{tx.description}</p>
                                                <p className="text-xs text-golden-orange mt-1">Amount: ${tx.amount.toLocaleString()}</p>
                                            </div>
                                            <button 
                                                onClick={() => handleProcessWithdrawal(tx.id)}
                                                className="bg-golden-orange text-espresso font-bold text-xs px-3 py-2 rounded hover:bg-white transition-colors"
                                            >
                                                Mark Paid
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                         {/* Global Ledger Summary */}
                         <div className="bg-[#1f0c05] border border-white/10 p-6 rounded-sm shadow-xl">
                            <h3 className="font-serif text-lg text-cream mb-4 flex items-center gap-2">
                                <Wallet size={18} className="text-golden-orange"/> Ledger Summary
                            </h3>
                            <div className="space-y-4">
                                <div className="flex justify-between border-b border-white/5 pb-2">
                                    <span className="text-sm text-cream/70">Total Fees Collected</span>
                                    <span className="text-sm font-bold text-green-400">
                                        ${transactions.filter(t => t.type === 'Fee' && t.status === 'Completed').reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between border-b border-white/5 pb-2">
                                    <span className="text-sm text-cream/70">Total Withdrawals Processed</span>
                                    <span className="text-sm font-bold text-blue-400">
                                        ${transactions.filter(t => t.type === 'Withdrawal' && t.status === 'Completed').reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between border-b border-white/5 pb-2">
                                    <span className="text-sm text-cream/70">Escrow Held</span>
                                    <span className="text-sm font-bold text-golden-orange">
                                        ${transactions.filter(t => t.type === 'Withdrawal' && t.status === 'Pending').reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                         </div>
                    </div>

                    <h3 className="font-serif text-lg text-cream mb-4">Master Transaction List</h3>
                    <div className="bg-[#1f0c05] border border-white/10 rounded-sm overflow-hidden">
                        <table className="w-full text-left text-sm text-cream/70">
                            <thead className="bg-white/5 uppercase text-xs tracking-wider text-golden-orange">
                                <tr>
                                    <th className="p-4">ID</th>
                                    <th className="p-4">Date</th>
                                    <th className="p-4">User</th>
                                    <th className="p-4">Type</th>
                                    <th className="p-4">Description</th>
                                    <th className="p-4">Method (Encrypted)</th>
                                    <th className="p-4">Amount</th>
                                    <th className="p-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {transactions.sort((a,b) => {
                                    const dateA = new Date(a.date).getTime();
                                    const dateB = new Date(b.date).getTime();
                                    // Handle invalid dates safely
                                    return (isNaN(dateB) ? 0 : dateB) - (isNaN(dateA) ? 0 : dateA);
                                }).map(tx => (
                                    <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4 text-xs font-mono opacity-50">{tx.id.substring(0,8)}...</td>
                                        <td className="p-4 text-xs">{tx.date}</td>
                                        <td className="p-4 font-bold">{tx.userName}</td>
                                        <td className="p-4">
                                             <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${
                                                tx.type === 'Fee' ? 'bg-purple-500/10 text-purple-400' :
                                                tx.type === 'Withdrawal' ? 'bg-blue-500/10 text-blue-400' : 
                                                tx.type === 'Credit' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                                            }`}>
                                                {tx.type}
                                            </span>
                                        </td>
                                        <td className="p-4 text-xs">{tx.description}</td>
                                        <td className="p-4 text-xs font-mono opacity-60">
                                            {tx.paymentMethod ? (tx.paymentMethod.includes('Bank') ? 'Bank Transfer' : tx.paymentMethod.includes('Wallet') ? 'Wallet' : 'Ext. Payment Gateway') : 'N/A'}
                                        </td>
                                        <td className="p-4 text-cream font-bold">${tx.amount.toLocaleString()}</td>
                                        <td className="p-4">
                                            {tx.status}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            
            {/* 6. GLOBAL ACTIVITY TAB */}
            {activeTab === 'global_activity' && (
                <div className="animate-fade-in">
                    <h2 className="font-serif text-2xl text-cream mb-6">Global Transaction Activity</h2>
                    <div className="bg-[#1f0c05] border border-white/10 rounded-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-cream/70">
                                <thead className="bg-white/5 uppercase text-xs tracking-wider text-golden-orange">
                                    <tr>
                                        <th className="p-4">Order ID</th>
                                        <th className="p-4">Date</th>
                                        <th className="p-4">Renter/Buyer</th>
                                        <th className="p-4">Item</th>
                                        <th className="p-4">Partner/Owner</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4">Admin Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {(orders || []).flatMap(order => (order?.items || []).map((item, idx) => ({ ...item, orderId: order.id, orderDate: order.date, renterName: order.userName }))).map((txn, i) => (
                                        <tr key={i} className="hover:bg-white/5 transition-colors">
                                            <td className="p-4 font-bold text-cream">{txn.orderId}</td>
                                            <td className="p-4 text-xs text-cream/50">{txn.orderDate}</td>
                                            <td className="p-4">{txn.renterName}</td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <img src={txn.product.images[0]} className="w-8 h-10 object-cover rounded bg-white/10" alt="" />
                                                    <div>
                                                        <p className="text-cream text-xs font-bold">{txn.product.name}</p>
                                                        <p className="text-[10px] text-golden-orange uppercase">{txn.type === 'buy' ? 'Purchase' : 'Rental'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                {txn.product.ownerId === 'stylus-official' ? <span className="text-golden-orange font-bold text-xs uppercase">Stylus Official</span> : 
                                                registeredUsers.find(u => u.id === txn.product.ownerId)?.name || 'Unknown Partner'}
                                            </td>
                                            <td className="p-4">
                                                <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded border ${
                                                    txn.status === 'Accepted' || txn.status === 'Shipped' || txn.status === 'Completed' ? 'border-green-500/30 text-green-400' :
                                                    txn.status === 'Rejected' || txn.status === 'Cancelled' ? 'border-red-500/30 text-red-400' :
                                                    'border-yellow-500/30 text-yellow-500'
                                                }`}>
                                                    {txn.status}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex gap-2">
                                                    {txn.status === 'Pending Approval' && (
                                                        <>
                                                            <button onClick={() => handleForceStatus(txn.orderId, txn.id, 'Accepted')} className="text-[10px] bg-green-500/20 text-green-400 px-2 py-1 rounded hover:bg-green-500 hover:text-white transition-colors">Force Accept</button>
                                                            <button onClick={() => handleForceStatus(txn.orderId, txn.id, 'Cancelled')} className="text-[10px] bg-red-500/20 text-red-400 px-2 py-1 rounded hover:bg-red-500 hover:text-white transition-colors">Force Cancel</button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* 2. RENTAL ANALYTICS TAB */}
            {activeTab === 'rentals' && (
                <div className="animate-fade-in">
                    <h2 className="font-serif text-2xl text-cream mb-6">Rental Analytics</h2>
                    
                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-[#1f0c05] border border-white/10 p-6 rounded-sm shadow-lg">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-xs text-cream/50 uppercase tracking-widest">Total Revenue</p>
                                    <p className="text-3xl font-serif text-golden-orange mt-1">$124,500</p>
                                </div>
                                <div className="p-2 bg-golden-orange/10 rounded">
                                    <DollarSign className="text-golden-orange" size={20}/>
                                </div>
                            </div>
                            <p className="text-xs text-green-400 flex items-center gap-1"><ArrowUp size={10}/> +12% vs last month</p>
                        </div>
                        
                        <div className="bg-[#1f0c05] border border-white/10 p-6 rounded-sm shadow-lg">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-xs text-cream/50 uppercase tracking-widest">Active Rentals</p>
                                    <p className="text-3xl font-serif text-cream mt-1">48</p>
                                </div>
                                <div className="p-2 bg-blue-500/10 rounded">
                                    <Activity className="text-blue-400" size={20}/>
                                </div>
                            </div>
                            <p className="text-xs text-green-400 flex items-center gap-1"><ArrowUp size={10}/> +5 new today</p>
                        </div>

                        <div className="bg-[#1f0c05] border border-white/10 p-6 rounded-sm shadow-lg">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-xs text-cream/50 uppercase tracking-widest">Avg. Order Value</p>
                                    <p className="text-3xl font-serif text-cream mt-1">$210</p>
                                </div>
                                <div className="p-2 bg-purple-500/10 rounded">
                                    <TrendingUp className="text-purple-400" size={20}/>
                                </div>
                            </div>
                        </div>

                         <div className="bg-[#1f0c05] border border-white/10 p-6 rounded-sm shadow-lg">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-xs text-cream/50 uppercase tracking-widest">Customer Satisfaction</p>
                                    <p className="text-3xl font-serif text-cream mt-1">4.8/5</p>
                                </div>
                                <div className="p-2 bg-green-500/10 rounded">
                                    <Star className="text-green-400" size={20}/>
                                </div>
                            </div>
                            <p className="text-xs text-cream/40">Based on 150 reviews</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Revenue Chart Visualization */}
                        <div className="lg:col-span-2 bg-[#1f0c05] border border-white/10 p-6 rounded-sm">
                            <h3 className="font-serif text-lg text-cream mb-6 flex items-center gap-2"><BarChart3 size={18}/> Revenue Trends (6 Months)</h3>
                            <div className="h-64 flex items-end justify-between gap-4 px-4 pb-4 border-b border-white/5 relative">
                                {[35, 45, 30, 60, 75, 95].map((h, i) => (
                                    <div key={i} className="flex flex-col items-center w-full group relative">
                                        <div 
                                            className="w-full bg-golden-orange/20 hover:bg-golden-orange transition-all duration-300 rounded-t-sm relative cursor-pointer" 
                                            style={{ height: `${h}%` }}
                                        >
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                ${h}k Revenue
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between text-xs text-cream/30 uppercase mt-4 px-4">
                                <span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span>
                            </div>
                        </div>

                         {/* Category Performance Chart */}
                        <div className="bg-[#1f0c05] border border-white/10 p-6 rounded-sm">
                             <h3 className="font-serif text-lg text-cream mb-6 flex items-center gap-2"><PieChart size={18}/> Category Performance</h3>
                             <div className="flex flex-col items-center justify-center">
                                 <div 
                                    className="w-48 h-48 rounded-full mb-8 relative shadow-2xl"
                                    style={{ background: getConicGradient() }}
                                 >
                                     <div className="absolute inset-4 bg-[#1f0c05] rounded-full flex items-center justify-center">
                                         <span className="text-xs text-cream/50 uppercase tracking-widest">Total Share</span>
                                     </div>
                                 </div>
                                 
                                 <div className="w-full space-y-3">
                                     {categoryData.map((d, i) => (
                                         <div key={i} className="flex justify-between items-center text-sm">
                                             <div className="flex items-center gap-2">
                                                 <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></div>
                                                 <span className="text-cream">{d.name}</span>
                                             </div>
                                             <span className="text-golden-orange font-bold">{d.value}%</span>
                                         </div>
                                     ))}
                                 </div>
                             </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 3. MARKETING INSIGHTS TAB */}
            {activeTab === 'marketing' && (
                <div className="animate-fade-in">
                    <h2 className="font-serif text-2xl text-cream mb-6">Marketing Insights</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-[#1f0c05] p-6 border border-white/10">
                            <h3 className="text-xs uppercase text-cream/50 tracking-widest mb-4">Customer Acquisition Cost</h3>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-serif text-cream">$45.20</span>
                                <span className="text-xs text-green-400 bg-green-900/20 px-2 py-1 rounded">-5% vs last month</span>
                            </div>
                            <div className="w-full bg-white/5 h-1 mt-4 rounded-full overflow-hidden">
                                <div className="bg-golden-orange w-[60%] h-full"></div>
                            </div>
                            <p className="text-xs text-cream/30 mt-2">Target: $40.00</p>
                        </div>
                        
                        <div className="bg-[#1f0c05] p-6 border border-white/10">
                            <h3 className="text-xs uppercase text-cream/50 tracking-widest mb-4">Retention Rate</h3>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-serif text-cream">78%</span>
                                <span className="text-xs text-green-400 bg-green-900/20 px-2 py-1 rounded">+2% vs last month</span>
                            </div>
                             <div className="w-full bg-white/5 h-1 mt-4 rounded-full overflow-hidden">
                                <div className="bg-blue-400 w-[78%] h-full"></div>
                            </div>
                             <p className="text-xs text-cream/30 mt-2">Industry Avg: 65%</p>
                        </div>

                         <div className="bg-[#1f0c05] p-6 border border-white/10">
                            <h3 className="text-xs uppercase text-cream/50 tracking-widest mb-4">Conversion Rate</h3>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-serif text-cream">3.2%</span>
                                <span className="text-xs text-red-400 bg-red-900/20 px-2 py-1 rounded">-0.5% vs last month</span>
                            </div>
                             <div className="w-full bg-white/5 h-1 mt-4 rounded-full overflow-hidden">
                                <div className="bg-purple-400 w-[32%] h-full"></div>
                            </div>
                             <p className="text-xs text-cream/30 mt-2">Target: 4.5%</p>
                        </div>
                    </div>

                    <div className="bg-[#1f0c05] border border-white/10 p-8">
                        <h3 className="font-serif text-xl text-cream mb-6">Active Campaigns</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-cream/70">
                                <thead className="text-xs uppercase text-cream/40 border-b border-white/5">
                                    <tr>
                                        <th className="pb-4">Campaign Name</th>
                                        <th className="pb-4">Channel</th>
                                        <th className="pb-4">Reach</th>
                                        <th className="pb-4">Clicks</th>
                                        <th className="pb-4">ROI</th>
                                        <th className="pb-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {[
                                        { name: 'Summer Gala Collection', channel: 'Instagram', reach: '125k', clicks: '4.2k', roi: '320%', status: 'Active' },
                                        { name: 'New User 20% Off', channel: 'Email', reach: '45k', clicks: '8.5k', roi: '450%', status: 'Active' },
                                        { name: 'Luxury Watch Feature', channel: 'Google Ads', reach: '80k', clicks: '1.2k', roi: '110%', status: 'Paused' },
                                    ].map((camp, i) => (
                                        <tr key={i} className="hover:bg-white/5">
                                            <td className="py-4 font-bold text-cream">{camp.name}</td>
                                            <td className="py-4">{camp.channel}</td>
                                            <td className="py-4">{camp.reach}</td>
                                            <td className="py-4">{camp.clicks}</td>
                                            <td className="py-4 text-green-400">{camp.roi}</td>
                                            <td className="py-4"><span className={`text-[10px] uppercase px-2 py-1 rounded ${camp.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-cream/50'}`}>{camp.status}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* 4. INVENTORY MANAGEMENT TAB */}
            {activeTab === 'inventory' && (
                <div className="animate-fade-in">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="font-serif text-2xl text-cream">Inventory Management</h2>
                        <div className="flex gap-2">
                             <div className="relative">
                                 <Search className="absolute left-3 top-2.5 text-cream/30" size={16}/>
                                 <input type="text" placeholder="Search SKU..." className="bg-black/20 border border-white/10 pl-10 pr-4 py-2 text-sm text-cream focus:border-golden-orange outline-none rounded-sm" />
                             </div>
                             <Button onClick={() => setShowAddStockModal(true)} className="text-xs h-9 flex items-center gap-2">
                                <Plus size={14} /> Add Stock
                             </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                         <div className="bg-[#1f0c05] p-4 border border-white/10">
                            <p className="text-xs text-cream/50 uppercase">Total Assets</p>
                            <p className="text-2xl font-serif text-cream">{products.length} Items</p>
                         </div>
                         <div className="bg-[#1f0c05] p-4 border border-white/10">
                            <p className="text-xs text-cream/50 uppercase">Asset Valuation</p>
                            <p className="text-2xl font-serif text-golden-orange">$4.2M</p>
                         </div>
                         <div className="bg-[#1f0c05] p-4 border border-white/10">
                            <p className="text-xs text-cream/50 uppercase">Top Performer</p>
                            <p className="text-lg font-serif text-cream truncate">Louis Vuitton Keepall</p>
                         </div>
                    </div>

                    <div className="bg-[#1f0c05] border border-white/10 rounded-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-cream/70">
                                <thead className="bg-white/5 uppercase text-xs tracking-wider text-golden-orange">
                                    <tr>
                                        <th className="p-4">Item Details</th>
                                        <th className="p-4">Category</th>
                                        <th className="p-4">Supplier</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4">Rentals</th>
                                        <th className="p-4">Performance</th>
                                        <th className="p-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {products.map(p => (
                                        <tr key={p.id} className="hover:bg-white/5 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <img src={p.images[0]} alt="" className="w-10 h-10 object-cover rounded bg-white/10"/>
                                                    <div>
                                                        <p className="font-bold text-cream">{p.name}</p>
                                                        <p className="text-[10px] text-cream/40 uppercase">{p.brand} • SKU-{p.id.substring(0,4)}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">{p.category}</td>
                                            <td className="p-4">{p.ownerId === 'stylus-official' ? 'In-House' : 'Partner'}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold border ${p.rentalCount && p.rentalCount > 10 ? 'border-yellow-500/50 text-yellow-500' : 'border-green-500/50 text-green-500'}`}>
                                                    Available
                                                </span>
                                            </td>
                                            <td className="p-4">{p.rentalCount || 0}</td>
                                            <td className="p-4">
                                                <div className="w-20 bg-white/10 h-1 rounded-full">
                                                    <div className="bg-green-400 h-full" style={{ width: `${Math.min(((p.rentalCount || 0) * 10), 100)}%` }}></div>
                                                </div>
                                            </td>
                                            <td className="p-4 flex gap-2">
                                                <button onClick={() => navigate(`/product/${p.id}`)} className="p-1 hover:text-white" title="View Product"><Eye size={16}/></button>
                                                <button onClick={() => handleDeleteProduct(p.id)} className="p-1 hover:text-red-400" title="Delete Product"><Trash2 size={16}/></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* 5. VERIFICATIONS TAB */}
            {activeTab === 'verifications' && (
                <div className="animate-fade-in">
                    <h2 className="font-serif text-2xl text-cream mb-6">Pending Verifications</h2>
                    {pendingVerifications.length === 0 ? (
                        <div className="bg-white/5 p-12 text-center border border-white/10">
                            <Check className="mx-auto text-green-400 mb-4 h-12 w-12 opacity-50"/>
                            <p className="text-cream/50 text-lg">All caught up! No pending verification requests.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6">
                            {pendingVerifications.map(u => (
                                <div key={u.id} className="bg-white/5 p-6 border border-white/10 flex flex-col md:flex-row justify-between items-start gap-6 hover:border-golden-orange/30 transition-colors shadow-lg">
                                    <div className="flex-grow w-full">
                                        <div className="flex justify-between items-center mb-4">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-xl text-cream font-bold font-serif">{u.name}</h3>
                                                <span className={`text-xs px-2 py-0.5 rounded border uppercase tracking-wide font-bold ${u.role === 'Partner' ? 'border-blue-400 text-blue-400' : 'border-golden-orange text-golden-orange'}`}>{u.role}</span>
                                            </div>
                                            <span className="text-[10px] text-cream/40 uppercase tracking-widest">Submitted: {u.lastActive}</span>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm text-cream/80 bg-black/20 p-6 rounded border border-white/5">
                                            {u.role === 'Partner' ? (
                                                <>
                                                    <div className="col-span-1 md:col-span-2 pb-2 border-b border-white/5 mb-2">
                                                        <p className="text-golden-orange text-xs uppercase font-bold mb-1">Business Details</p>
                                                    </div>
                                                    <p><span className="text-cream/40 uppercase text-xs block mb-1">Business Name:</span> {u.verificationDocs?.businessName || 'N/A'}</p>
                                                    <p><span className="text-cream/40 uppercase text-xs block mb-1">CAC Number:</span> {u.verificationDocs?.cacNumber || 'N/A'}</p>
                                                    <p><span className="text-cream/40 uppercase text-xs block mb-1">Director BVN:</span> {u.verificationDocs?.bvn || 'N/A'}</p>
                                                    
                                                    <div className="col-span-1 md:col-span-2 mt-2 text-xs text-blue-300 bg-blue-900/20 p-2 rounded border border-blue-500/30">
                                                        <span className="font-bold uppercase">Requested Access:</span> Seller Platform
                                                        <p className="opacity-70 mt-1">Approving this request will enable: Inventory Management, Order Processing, Earnings Withdrawal.</p>
                                                    </div>

                                                    <div className="col-span-1 md:col-span-2 mt-4 flex items-center justify-between border-t border-white/5 pt-4">
                                                        <p className="text-green-400 font-bold flex items-center gap-2 text-xs uppercase tracking-wide"><Check size={14}/> Fee Paid (₦20,000)</p>
                                                        {u.verificationDocs?.cacCertUrl && (
                                                            <button 
                                                                onClick={() => setSelectedDoc({ url: u.verificationDocs!.cacCertUrl!, title: `CAC Certificate: ${u.verificationDocs?.businessName}` })}
                                                                className="text-white bg-white/10 hover:bg-white/20 px-3 py-2 rounded text-xs font-bold flex items-center gap-2 transition-colors"
                                                            >
                                                                <Eye size={14}/> View CAC Certificate
                                                            </button>
                                                        )}
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="col-span-1 md:col-span-2 pb-2 border-b border-white/5 mb-2">
                                                        <p className="text-golden-orange text-xs uppercase font-bold mb-1">Personal Identity</p>
                                                    </div>
                                                    <p><span className="text-cream/40 uppercase text-xs block mb-1">BVN:</span> {u.verificationDocs?.bvn || 'N/A'}</p>
                                                    <p><span className="text-cream/40 uppercase text-xs block mb-1">ID Type:</span> {u.verificationDocs?.idType || 'N/A'}</p>
                                                    
                                                    <div className="col-span-1 md:col-span-2 mt-2 text-xs text-golden-orange bg-golden-orange/10 p-2 rounded border border-golden-orange/30">
                                                        <span className="font-bold uppercase">Requested Access:</span> Verified Renter
                                                        <p className="opacity-70 mt-1">Approving this request will enable: High-value Rentals, Purchases, Insurance Coverage.</p>
                                                    </div>

                                                    <div className="col-span-1 md:col-span-2 mt-4 flex justify-end border-t border-white/5 pt-4">
                                                        {u.verificationDocs?.govIdUrl && (
                                                            <button 
                                                                onClick={() => setSelectedDoc({ url: u.verificationDocs!.govIdUrl!, title: `ID Document: ${u.name}` })}
                                                                className="text-white bg-white/10 hover:bg-white/20 px-3 py-2 rounded text-xs font-bold flex items-center gap-2 transition-colors"
                                                            >
                                                                <Eye size={14}/> View Identity Document
                                                            </button>
                                                        )}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-row md:flex-col gap-3 min-w-[140px] w-full md:w-auto mt-4 md:mt-0">
                                        <button 
                                            onClick={() => handleApprove(u.id, u.name)} 
                                            className="w-full bg-green-600 hover:bg-green-500 text-white px-4 py-3 text-sm font-bold rounded-sm transition-colors shadow-lg flex items-center justify-center gap-2 uppercase tracking-wide"
                                        >
                                            <Check size={16}/> Approve
                                        </button>
                                        <button 
                                            onClick={() => handleReject(u.id)} 
                                            className="w-full bg-red-600 hover:bg-red-500 text-white px-4 py-3 text-sm font-bold rounded-sm transition-colors shadow-lg flex items-center justify-center gap-2 uppercase tracking-wide"
                                        >
                                            <X size={16}/> Reject
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    </div>
  );
};
