import React, { useState } from 'react';
import { Users, BarChart3, Package, Megaphone, TrendingUp, DollarSign, Activity, AlertTriangle, Star, Truck, ShoppingBag, LogOut, X, Mail, Ban, Key, Check, Plus, Search } from 'lucide-react';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// --- Interfaces ---
interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  tier: string;
  status: 'Active' | 'Suspended';
  joined: string;
  lastActive: string;
  avgSpend: string;
  rentalHistoryCount: number;
}

interface InventoryItem {
  id: string;
  name: string;
  stock: number;
  condition: string;
  rentals: number;
  supplier: string;
  supplierRating: number;
}

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'analytics' | 'inventory' | 'marketing'>('users');
  const { logout } = useAuth();
  const navigate = useNavigate();

  // --- State for Interactive Features ---
  
  // 1. User Management State
  const [users, setUsers] = useState<AdminUser[]>([
      { id: '1', name: 'Victoria Sterling', email: 'v.sterling@example.com', phone: '+1 (555) 010-9988', address: '125 Park Ave, NYC', tier: 'Diamond', status: 'Active', joined: 'Oct 2023', lastActive: '2 mins ago', avgSpend: '$450', rentalHistoryCount: 12 },
      { id: '2', name: 'James Bond', email: 'j.bond@example.com', phone: '+44 20 7946 0958', address: '85 Albert Embankment, London', tier: 'Platinum', status: 'Active', joined: 'Nov 2023', lastActive: '1 day ago', avgSpend: '$820', rentalHistoryCount: 5 },
      { id: '3', name: 'Sarah Connor', email: 's.connor@example.com', phone: '+1 (555) 019-2834', address: '1984 Cyberdyne Ln, LA', tier: 'Gold', status: 'Suspended', joined: 'Dec 2023', lastActive: '3 months ago', avgSpend: '$150', rentalHistoryCount: 1 },
      { id: '4', name: 'Ellen Ripley', email: 'e.ripley@example.com', phone: '+1 (555) 011-3344', address: 'Nostromo Station', tier: 'Diamond', status: 'Active', joined: 'Jan 2024', lastActive: '5 hours ago', avgSpend: '$1,200', rentalHistoryCount: 8 },
  ]);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  // 2. Inventory State
  const [inventory, setInventory] = useState<InventoryItem[]>([
      { id: 'SKU-001', name: 'Midnight Velvet Gown', stock: 2, condition: 'Excellent', rentals: 14, supplier: 'McQueen Direct', supplierRating: 4.9 },
      { id: 'SKU-002', name: 'Oyster Tuxedo', stock: 5, condition: 'Good', rentals: 32, supplier: 'Tom Ford Wholesale', supplierRating: 4.8 },
      { id: 'SKU-003', name: 'Sapphire Clutch', stock: 1, condition: 'Fair', rentals: 8, supplier: 'Chanel Resale Partners', supplierRating: 4.5 },
      { id: 'SKU-004', name: 'Heritage Chronograph', stock: 1, condition: 'Mint', rentals: 3, supplier: 'Patek Certified', supplierRating: 5.0 },
  ]);
  const [showAddSkuModal, setShowAddSkuModal] = useState(false);
  const [newSkuData, setNewSkuData] = useState({ name: '', stock: 1, supplier: '' });

  // 3. Analytics State
  const [timeframe, setTimeframe] = useState('This Month');

  // --- Actions ---

  const handleLogout = () => {
      if(window.confirm("Are you sure you want to log out of the admin panel?")) {
        logout();
        navigate('/login');
      }
  };

  // User Actions
  const toggleUserStatus = (userId: string) => {
    setUsers(users.map(u => {
        if (u.id === userId) {
            const newStatus = u.status === 'Active' ? 'Suspended' : 'Active';
            alert(`User ${u.name} has been ${newStatus}.`);
            return { ...u, status: newStatus };
        }
        return u;
    }));
    if (selectedUser && selectedUser.id === userId) {
        setSelectedUser(prev => prev ? { ...prev, status: prev.status === 'Active' ? 'Suspended' : 'Active'} : null);
    }
  };

  const resetPassword = (userName: string) => {
      alert(`Password reset link sent to ${userName}'s email.`);
  };

  const emailUser = (userName: string) => {
      alert(`Compose message window opened for ${userName}.`);
  };

  // Inventory Actions
  const handleAddSku = (e: React.FormEvent) => {
      e.preventDefault();
      if(!newSkuData.name || !newSkuData.supplier) return;

      const newItem: InventoryItem = {
          id: `SKU-${Math.floor(Math.random() * 10000)}`,
          name: newSkuData.name,
          stock: newSkuData.stock,
          supplier: newSkuData.supplier,
          condition: 'New',
          rentals: 0,
          supplierRating: 5.0
      };

      setInventory([...inventory, newItem]);
      setShowAddSkuModal(false);
      setNewSkuData({ name: '', stock: 1, supplier: '' });
      alert(`${newItem.name} added to inventory.`);
  };

  // Analytics Logic
  const getGraphData = () => {
      switch(timeframe) {
          case 'Last Quarter': return [60, 55, 70, 65, 80, 75, 85, 90, 80, 70, 60, 65];
          case 'YTD': return [40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95];
          default: return [40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 95, 80];
      }
  };
  const graphData = getGraphData();

  return (
    <div className="min-h-screen bg-espresso pt-8 pb-20 animate-fade-in relative">
      
      {/* --- MODALS --- */}

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setSelectedUser(null)}>
            <div className="bg-[#1f0c05] border border-golden-orange w-full max-w-2xl rounded-sm shadow-[0_0_50px_rgba(225,175,77,0.1)] overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="bg-white/5 p-6 border-b border-white/10 flex justify-between items-center">
                    <h2 className="font-serif text-2xl text-cream flex items-center gap-3">
                        <div className="w-10 h-10 bg-golden-orange rounded-full flex items-center justify-center text-espresso font-bold text-lg">
                            {selectedUser.name.charAt(0)}
                        </div>
                        {selectedUser.name}
                    </h2>
                    <button onClick={() => setSelectedUser(null)} className="text-cream/50 hover:text-golden-orange transition-colors"><X size={24}/></button>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div>
                            <p className="text-xs uppercase text-cream/40 tracking-widest">Contact Information</p>
                            <p className="text-cream mt-1 flex items-center gap-2"><Mail size={14} className="text-golden-orange"/> {selectedUser.email}</p>
                            <p className="text-cream mt-1">{selectedUser.phone}</p>
                            <p className="text-cream mt-1 text-sm opacity-70">{selectedUser.address}</p>
                        </div>
                        <div>
                            <p className="text-xs uppercase text-cream/40 tracking-widest">Account Details</p>
                            <p className="text-cream mt-1">Tier: <span className="text-golden-orange">{selectedUser.tier}</span></p>
                            <p className="text-cream mt-1">Member Since: {selectedUser.joined}</p>
                            <p className="text-cream mt-1">Status: <span className={selectedUser.status === 'Active' ? 'text-green-400' : 'text-red-400'}>{selectedUser.status}</span></p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                             <p className="text-xs uppercase text-cream/40 tracking-widest">Rental Stats</p>
                             <div className="grid grid-cols-2 gap-4 mt-2">
                                 <div className="bg-white/5 p-3 text-center">
                                     <span className="block text-2xl font-serif text-cream">{selectedUser.rentalHistoryCount}</span>
                                     <span className="text-[10px] uppercase text-cream/50">Total Rentals</span>
                                 </div>
                                 <div className="bg-white/5 p-3 text-center">
                                     <span className="block text-2xl font-serif text-cream">{selectedUser.avgSpend}</span>
                                     <span className="text-[10px] uppercase text-cream/50">Avg. Spend</span>
                                 </div>
                             </div>
                        </div>
                        <div className="pt-4 flex flex-col gap-3">
                            <Button variant="outline" onClick={() => emailUser(selectedUser.name)} className="flex items-center justify-center gap-2 h-10 text-sm">
                                <Mail size={14} /> Send Email
                            </Button>
                            <Button variant="outline" onClick={() => resetPassword(selectedUser.name)} className="flex items-center justify-center gap-2 h-10 text-sm">
                                <Key size={14} /> Reset Password
                            </Button>
                            <button 
                                onClick={() => toggleUserStatus(selectedUser.id)}
                                className={`flex items-center justify-center gap-2 h-10 text-sm font-bold uppercase tracking-widest border transition-colors ${
                                    selectedUser.status === 'Active' 
                                    ? 'border-red-500/50 text-red-400 hover:bg-red-500/10' 
                                    : 'border-green-500/50 text-green-400 hover:bg-green-500/10'
                                }`}
                            >
                                {selectedUser.status === 'Active' ? <><Ban size={14}/> Suspend User</> : <><Check size={14}/> Activate User</>}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Add SKU Modal */}
      {showAddSkuModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setShowAddSkuModal(false)}>
              <div className="bg-[#1f0c05] border border-golden-orange w-full max-w-md rounded-sm shadow-2xl" onClick={e => e.stopPropagation()}>
                  <div className="bg-white/5 p-6 border-b border-white/10 flex justify-between items-center">
                      <h2 className="font-serif text-xl text-cream">Add New SKU</h2>
                      <button onClick={() => setShowAddSkuModal(false)} className="text-cream/50 hover:text-golden-orange transition-colors"><X size={20}/></button>
                  </div>
                  <form onSubmit={handleAddSku} className="p-6 space-y-4">
                      <div>
                          <label className="block text-xs uppercase tracking-widest text-cream/50 mb-2">Product Name</label>
                          <input 
                            required
                            type="text" 
                            className="w-full bg-black/20 border border-white/10 text-cream p-3 focus:border-golden-orange outline-none"
                            value={newSkuData.name}
                            onChange={(e) => setNewSkuData({...newSkuData, name: e.target.value})}
                          />
                      </div>
                      <div>
                          <label className="block text-xs uppercase tracking-widest text-cream/50 mb-2">Supplier</label>
                          <input 
                            required
                            type="text" 
                            className="w-full bg-black/20 border border-white/10 text-cream p-3 focus:border-golden-orange outline-none"
                            value={newSkuData.supplier}
                            onChange={(e) => setNewSkuData({...newSkuData, supplier: e.target.value})}
                          />
                      </div>
                      <div>
                          <label className="block text-xs uppercase tracking-widest text-cream/50 mb-2">Initial Stock</label>
                          <input 
                            required
                            type="number" 
                            min="1"
                            className="w-full bg-black/20 border border-white/10 text-cream p-3 focus:border-golden-orange outline-none"
                            value={newSkuData.stock}
                            onChange={(e) => setNewSkuData({...newSkuData, stock: parseInt(e.target.value)})}
                          />
                      </div>
                      <div className="pt-4">
                          <Button fullWidth type="submit">Add to Inventory</Button>
                      </div>
                  </form>
              </div>
          </div>
      )}


      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-white/10 pb-6">
            <div>
                <span className="text-golden-orange uppercase tracking-widest text-xs font-bold">Administrative Access</span>
                <h1 className="font-serif text-4xl text-cream mt-2">Executive Dashboard</h1>
            </div>
            
            <div className="flex flex-col items-end gap-4 mt-4 md:mt-0">
                <Button variant="outline" onClick={handleLogout} className="text-xs py-2 px-4 flex items-center gap-2 border-white/20 hover:border-red-500 hover:text-red-400 hover:bg-transparent">
                   <LogOut size={14}/> Sign Out
                </Button>
                <div className="bg-white/5 rounded-lg p-1 flex overflow-x-auto">
                    <button onClick={() => setActiveTab('users')} className={`px-4 py-2 rounded text-sm transition-colors whitespace-nowrap ${activeTab === 'users' ? 'bg-golden-orange text-espresso font-bold' : 'text-cream hover:bg-white/5'}`}>User Management</button>
                    <button onClick={() => setActiveTab('analytics')} className={`px-4 py-2 rounded text-sm transition-colors whitespace-nowrap ${activeTab === 'analytics' ? 'bg-golden-orange text-espresso font-bold' : 'text-cream hover:bg-white/5'}`}>Rental Analytics</button>
                    <button onClick={() => setActiveTab('inventory')} className={`px-4 py-2 rounded text-sm transition-colors whitespace-nowrap ${activeTab === 'inventory' ? 'bg-golden-orange text-espresso font-bold' : 'text-cream hover:bg-white/5'}`}>Inventory & Suppliers</button>
                    <button onClick={() => setActiveTab('marketing')} className={`px-4 py-2 rounded text-sm transition-colors whitespace-nowrap ${activeTab === 'marketing' ? 'bg-golden-orange text-espresso font-bold' : 'text-cream hover:bg-white/5'}`}>Marketing Insights</button>
                </div>
            </div>
        </div>

        {/* --- USERS TAB --- */}
        {activeTab === 'users' && (
            <div className="animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-[#1f0c05] p-6 border border-white/5 border-l-4 border-l-golden-orange">
                        <p className="text-cream/60 text-xs uppercase tracking-wide">Total Users</p>
                        <p className="text-3xl text-cream font-serif font-bold">1,248</p>
                    </div>
                     <div className="bg-[#1f0c05] p-6 border border-white/5 border-l-4 border-l-green-500">
                        <p className="text-cream/60 text-xs uppercase tracking-wide">Active Members</p>
                        <p className="text-3xl text-cream font-serif font-bold">892</p>
                    </div>
                     <div className="bg-[#1f0c05] p-6 border border-white/5 border-l-4 border-l-blue-500">
                        <p className="text-cream/60 text-xs uppercase tracking-wide">Avg. Session Time</p>
                        <p className="text-3xl text-cream font-serif font-bold">12m 30s</p>
                    </div>
                     <div className="bg-[#1f0c05] p-6 border border-white/5 border-l-4 border-l-purple-500">
                        <p className="text-cream/60 text-xs uppercase tracking-wide">Retention Rate</p>
                        <p className="text-3xl text-cream font-serif font-bold">88%</p>
                    </div>
                </div>

                <div className="bg-[#1f0c05] border border-white/5 overflow-hidden rounded-sm">
                    <div className="p-6 border-b border-white/5">
                        <h3 className="font-serif text-xl text-cream flex items-center gap-2"><Users size={20} className="text-golden-orange"/> User Activity & Behavior</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-cream/80">
                            <thead className="bg-white/5 uppercase text-xs font-bold text-golden-orange">
                                <tr>
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4">Email</th>
                                    <th className="px-6 py-4">Membership</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Last Active</th>
                                    <th className="px-6 py-4">Avg. Spend</th>
                                    <th className="px-6 py-4">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {users.map(u => (
                                    <tr key={u.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 font-bold">{u.name}</td>
                                        <td className="px-6 py-4">{u.email}</td>
                                        <td className="px-6 py-4"><span className="px-2 py-1 bg-white/10 rounded text-xs border border-white/10">{u.tier}</span></td>
                                        <td className="px-6 py-4">
                                            <span className={`flex items-center gap-1 ${u.status === 'Active' ? 'text-green-400' : 'text-red-400'}`}>
                                                <div className={`w-2 h-2 rounded-full ${u.status === 'Active' ? 'bg-green-400' : 'bg-red-400'}`}></div>
                                                {u.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs">{u.lastActive}</td>
                                        <td className="px-6 py-4 text-golden-orange">{u.avgSpend}</td>
                                        <td className="px-6 py-4">
                                            <button onClick={() => setSelectedUser(u)} className="text-golden-orange hover:text-white underline">Details</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )}

        {/* --- ANALYTICS TAB --- */}
        {activeTab === 'analytics' && (
            <div className="animate-fade-in">
                {/* Revenue & Satisfaction Top Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                     <div className="lg:col-span-2 bg-[#1f0c05] p-8 border border-white/5 rounded-sm">
                         <div className="flex justify-between items-center mb-6">
                            <h3 className="font-serif text-xl text-cream flex items-center gap-2"><DollarSign size={20} className="text-golden-orange"/> Revenue Performance</h3>
                            <select 
                                value={timeframe} 
                                onChange={(e) => setTimeframe(e.target.value)}
                                className="bg-black/20 text-xs text-cream border border-white/10 px-2 py-1 rounded focus:border-golden-orange outline-none cursor-pointer"
                            >
                                <option value="This Month">This Month</option>
                                <option value="Last Quarter">Last Quarter</option>
                                <option value="YTD">YTD</option>
                            </select>
                         </div>
                         <div className="h-48 flex items-end gap-2 justify-between px-4 border-b border-white/5 pb-4 transition-all duration-500">
                             {graphData.map((h, i) => (
                                 <div key={i} className="w-full bg-golden-orange/20 hover:bg-golden-orange transition-all duration-500 relative group rounded-t" style={{height: `${h}%`}}>
                                     <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-espresso text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10">${h}k</div>
                                 </div>
                             ))}
                         </div>
                         <div className="flex justify-between mt-4 text-xs text-cream/40 uppercase tracking-widest">
                             <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
                         </div>
                     </div>

                     <div className="bg-[#1f0c05] p-8 border border-white/5 rounded-sm flex flex-col justify-center text-center">
                         <h3 className="font-serif text-xl text-cream mb-4 flex items-center justify-center gap-2"><Star size={20} className="text-golden-orange"/> Customer Satisfaction</h3>
                         <div className="text-6xl font-serif text-cream mb-2">4.9<span className="text-2xl text-cream/50">/5</span></div>
                         <div className="flex justify-center gap-1 mb-6">
                             {[1,2,3,4,5].map(s => <Star key={s} size={20} className="fill-golden-orange text-golden-orange" />)}
                         </div>
                         <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden mb-2">
                             <div className="bg-green-500 h-full" style={{width: '92%'}}></div>
                         </div>
                         <p className="text-xs text-cream/40 uppercase tracking-wide">92% Positive Feedback</p>
                     </div>
                </div>
                
                {/* Secondary Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="bg-[#1f0c05] p-8 border border-white/5 rounded-sm">
                         <h3 className="font-serif text-xl text-cream mb-6 flex items-center gap-2"><TrendingUp size={20} className="text-golden-orange"/> Category Performance</h3>
                         <div className="space-y-6">
                             <div>
                                 <div className="flex justify-between text-sm text-cream mb-1 font-bold"><span>Women's Gowns</span><span>45%</span></div>
                                 <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden"><div className="bg-golden-orange h-full" style={{width: '45%'}}></div></div>
                             </div>
                              <div>
                                 <div className="flex justify-between text-sm text-cream mb-1 font-bold"><span>Men's Tuxedos</span><span>25%</span></div>
                                 <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden"><div className="bg-golden-orange h-full" style={{width: '25%'}}></div></div>
                             </div>
                              <div>
                                 <div className="flex justify-between text-sm text-cream mb-1 font-bold"><span>Watches</span><span>20%</span></div>
                                 <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden"><div className="bg-golden-orange h-full" style={{width: '20%'}}></div></div>
                             </div>
                         </div>
                     </div>

                     <div className="bg-[#1f0c05] p-8 border border-white/5 rounded-sm">
                        <h3 className="font-serif text-xl text-cream mb-6 flex items-center gap-2"><Activity size={20} className="text-golden-orange"/> Rental Activity</h3>
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <p className="text-3xl font-serif text-cream">142</p>
                                <p className="text-xs text-cream/40 uppercase">Active Rentals</p>
                            </div>
                            <div className="text-right">
                                <p className="text-3xl font-serif text-cream text-green-400">98%</p>
                                <p className="text-xs text-cream/40 uppercase">On-Time Returns</p>
                            </div>
                        </div>
                        <div className="border-t border-white/10 pt-6">
                            <p className="text-sm text-cream/70 mb-2">Upcoming Returns (Next 24h)</p>
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs bg-white/5 p-2 rounded">
                                    <span>Ord #9921 - Velvet Gown</span>
                                    <span className="text-golden-orange">Due in 4h</span>
                                </div>
                                <div className="flex justify-between text-xs bg-white/5 p-2 rounded">
                                    <span>Ord #9924 - Tom Ford Tux</span>
                                    <span className="text-golden-orange">Due in 8h</span>
                                </div>
                            </div>
                        </div>
                     </div>
                </div>
            </div>
        )}

        {/* --- INVENTORY TAB --- */}
        {activeTab === 'inventory' && (
             <div className="animate-fade-in bg-[#1f0c05] border border-white/5 overflow-hidden rounded-sm">
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                    <h3 className="font-serif text-xl text-cream flex items-center gap-2"><Package size={20} className="text-golden-orange"/> Inventory & Supplier Performance</h3>
                    <Button variant="secondary" className="text-xs py-2 px-4 flex items-center gap-2" onClick={() => setShowAddSkuModal(true)}>
                        <Plus size={14}/> Add New SKU
                    </Button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-cream/80">
                        <thead className="bg-white/5 uppercase text-xs font-bold text-golden-orange">
                            <tr>
                                <th className="px-6 py-4">SKU</th>
                                <th className="px-6 py-4">Product Name</th>
                                <th className="px-6 py-4">Stock</th>
                                <th className="px-6 py-4">Rentals</th>
                                <th className="px-6 py-4">Supplier</th>
                                <th className="px-6 py-4">Performance</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {inventory.map(item => (
                                <tr key={item.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 font-mono text-xs">{item.id}</td>
                                    <td className="px-6 py-4 font-bold">{item.name}</td>
                                    <td className="px-6 py-4">{item.stock} units</td>
                                    <td className="px-6 py-4">{item.rentals}</td>
                                    <td className="px-6 py-4 text-xs uppercase tracking-wide opacity-70">{item.supplier}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1">
                                            <Star size={12} className="fill-golden-orange text-golden-orange"/>
                                            <span>{item.supplierRating}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {item.stock < 2 ? <span className="text-red-400 flex items-center gap-1 text-xs uppercase font-bold"><AlertTriangle size={12}/> Low</span> : <span className="text-green-400 text-xs uppercase font-bold">Good</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* --- MARKETING TAB --- */}
        {activeTab === 'marketing' && (
             <div className="animate-fade-in">
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                     <div className="bg-[#1f0c05] p-6 border border-white/5 text-center">
                         <h4 className="text-golden-orange uppercase text-xs tracking-widest mb-2">CAC</h4>
                         <p className="text-4xl text-cream font-serif">$45.20</p>
                         <p className="text-green-400 text-xs mt-2">Cost Per Acquisition</p>
                     </div>
                     <div className="bg-[#1f0c05] p-6 border border-white/5 text-center">
                         <h4 className="text-golden-orange uppercase text-xs tracking-widest mb-2">Conversion</h4>
                         <p className="text-4xl text-cream font-serif">3.8%</p>
                         <p className="text-green-400 text-xs mt-2">Visitor to Rental</p>
                     </div>
                     <div className="bg-[#1f0c05] p-6 border border-white/5 text-center">
                         <h4 className="text-golden-orange uppercase text-xs tracking-widest mb-2">Total Ad Spend</h4>
                         <p className="text-4xl text-cream font-serif">$12.4k</p>
                         <p className="text-cream/40 text-xs mt-2">Monthly Budget: $15k</p>
                     </div>
                     <div className="bg-[#1f0c05] p-6 border border-white/5 text-center">
                         <h4 className="text-golden-orange uppercase text-xs tracking-widest mb-2">Social Reach</h4>
                         <p className="text-4xl text-cream font-serif">1.2M</p>
                         <p className="text-green-400 text-xs mt-2">Impressions</p>
                     </div>
                 </div>

                 <div className="bg-[#1f0c05] border border-white/5 overflow-hidden rounded-sm">
                    <div className="p-6 border-b border-white/5">
                        <h3 className="font-serif text-xl text-cream flex items-center gap-2"><Megaphone size={20} className="text-golden-orange"/> Campaign Performance</h3>
                    </div>
                     <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-cream/80">
                            <thead className="bg-white/5 uppercase text-xs font-bold text-golden-orange">
                                <tr>
                                    <th className="px-6 py-4">Campaign ID</th>
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4">Channel</th>
                                    <th className="px-6 py-4">Cost</th>
                                    <th className="px-6 py-4">Acq. Cost</th>
                                    <th className="px-6 py-4">ROI</th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {[
                                  { id: 'CMP-001', name: 'Winter Gala', channel: 'Instagram', cost: '$2,500', roi: '340%', status: 'Active', acquisitionCost: '$45' },
                                  { id: 'CMP-002', name: 'Summer Wedding', channel: 'Email', cost: '$500', roi: '120%', status: 'Scheduled', acquisitionCost: '$12' },
                                  { id: 'CMP-003', name: 'Corporate Power', channel: 'LinkedIn', cost: '$1,200', roi: '210%', status: 'Active', acquisitionCost: '$85' }
                                ].map(c => (
                                    <tr key={c.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs">{c.id}</td>
                                        <td className="px-6 py-4 font-bold">{c.name}</td>
                                        <td className="px-6 py-4">{c.channel}</td>
                                        <td className="px-6 py-4">{c.cost}</td>
                                        <td className="px-6 py-4">{c.acquisitionCost}</td>
                                        <td className="px-6 py-4 text-green-400 font-bold">{c.roi}</td>
                                        <td className="px-6 py-4">
                                             <span className={`px-2 py-1 text-xs rounded border ${c.status === 'Active' ? 'border-green-500 text-green-500' : 'border-white/20 text-cream/50'}`}>
                                            {c.status}
                                        </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                 </div>
             </div>
        )}

      </div>
    </div>
  );
};