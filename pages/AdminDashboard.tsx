import React, { useState } from 'react';
import { Users, BarChart3, Package, Megaphone, TrendingUp, DollarSign, Activity, AlertTriangle, Star, Truck, ShoppingBag, LogOut, X, Mail, Ban, Key, Check, Plus, Search, Trash2, Shield, UserCog, Briefcase, Filter } from 'lucide-react';
import { Button } from '../components/Button';
import { useAuth, RegisteredUser } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// --- Interfaces ---
// InventoryItem remains local for now as requested to only touch user registration flow
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
  const { logout, registeredUsers, updateUserStatus, updateUserRole, deleteUser } = useAuth();
  const navigate = useNavigate();

  // --- State for Interactive Features ---
  
  // 1. User Management State (Consumed from Context)
  const [selectedUser, setSelectedUser] = useState<RegisteredUser | null>(null);
  const [userRoleFilter, setUserRoleFilter] = useState<string>('All');
  const [userStatusFilter, setUserStatusFilter] = useState<string>('All');

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
  const toggleUserStatus = (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
    let reason = '';

    if (newStatus === 'Suspended') {
        const input = window.prompt("Please enter a reason for suspension:");
        if (input === null) return; // Cancelled
        reason = input || 'Violation of terms'; // Default fallback
    }

    updateUserStatus(userId, newStatus, reason);
    
    // Update local modal state if open
    if (selectedUser && selectedUser.id === userId) {
        setSelectedUser({ 
            ...selectedUser, 
            status: newStatus,
            suspensionReason: newStatus === 'Suspended' ? reason : undefined
        });
    }
    alert(`User status updated to ${newStatus}.`);
  };

  const handleChangeRole = (userId: string, currentRole: string, newRole: 'User' | 'Collaborator' | 'Admin') => {
      if (currentRole === newRole) return;
      
      const confirmMessage = newRole === 'Admin' 
          ? `WARNING: You are about to grant ADMIN privileges to this user. They will have full access to the dashboard. Proceed?` 
          : `Are you sure you want to change this user's role from ${currentRole} to ${newRole}?`;

      if (window.confirm(confirmMessage)) {
          updateUserRole(userId, newRole);
          // Update local modal state if open
          if (selectedUser && selectedUser.id === userId) {
              setSelectedUser({ ...selectedUser, role: newRole });
          }
      }
  };

  const handleDeleteUser = (userId: string) => {
      if (window.confirm("WARNING: This action is permanent. Are you sure you want to delete this user data?")) {
          deleteUser(userId);
          setSelectedUser(null);
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

  // Logic for filtered users
  const filteredUsers = registeredUsers.filter(u => {
      const matchRole = userRoleFilter === 'All' || u.role === userRoleFilter;
      const matchStatus = userStatusFilter === 'All' || u.status === userStatusFilter;
      return matchRole && matchStatus;
  });

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
                            <p className="text-cream mt-1">{selectedUser.phone || 'N/A'}</p>
                            <p className="text-cream mt-1 text-sm opacity-70">{selectedUser.address || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-xs uppercase text-cream/40 tracking-widest">Account Details</p>
                            <p className="text-cream mt-1">Tier: <span className="text-golden-orange">{selectedUser.tier}</span></p>
                            <p className="text-cream mt-1">Role: <span className="text-white font-bold">{selectedUser.role}</span></p>
                            <p className="text-cream mt-1">Member Since: {selectedUser.joined}</p>
                            <div className="mt-2">
                                <p className="text-cream flex items-center gap-2">Status: 
                                    <span className={`px-2 py-0.5 rounded text-xs border ${selectedUser.status === 'Active' ? 'border-green-500 text-green-400 bg-green-500/10' : 'border-red-500 text-red-400 bg-red-500/10'}`}>
                                        {selectedUser.status}
                                    </span>
                                </p>
                                {selectedUser.status === 'Suspended' && selectedUser.suspensionReason && (
                                    <div className="mt-2 p-3 bg-red-500/10 border border-red-500/30 rounded-sm">
                                        <p className="text-[10px] text-red-400 uppercase font-bold tracking-widest mb-1">Suspension Reason</p>
                                        <p className="text-sm text-cream/80 italic">"{selectedUser.suspensionReason}"</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* Role Management */}
                        <div className="pt-4 border-t border-white/5">
                             <p className="text-xs uppercase text-cream/40 tracking-widest mb-3 flex items-center gap-2">
                                <UserCog size={14} className="text-golden-orange"/> Role Management
                             </p>
                             <div className="flex gap-2">
                                <button 
                                    onClick={() => handleChangeRole(selectedUser.id, selectedUser.role, 'User')}
                                    className={`flex-1 px-2 py-2 text-xs border rounded transition-colors flex items-center justify-center gap-1 ${
                                        selectedUser.role === 'User' 
                                        ? 'bg-cream text-espresso border-cream font-bold' 
                                        : 'border-white/20 text-cream/60 hover:border-golden-orange'
                                    }`}
                                >
                                    User
                                </button>
                                <button 
                                    onClick={() => handleChangeRole(selectedUser.id, selectedUser.role, 'Collaborator')}
                                    className={`flex-1 px-2 py-2 text-xs border rounded transition-colors flex items-center justify-center gap-1 ${
                                        selectedUser.role === 'Collaborator' 
                                        ? 'bg-blue-500 text-white border-blue-500 font-bold' 
                                        : 'border-white/20 text-cream/60 hover:border-blue-500'
                                    }`}
                                >
                                    Partner
                                </button>
                                <button 
                                    onClick={() => handleChangeRole(selectedUser.id, selectedUser.role, 'Admin')}
                                    className={`flex-1 px-2 py-2 text-xs border rounded transition-colors flex items-center justify-center gap-1 ${
                                        selectedUser.role === 'Admin' 
                                        ? 'bg-golden-orange text-espresso border-golden-orange font-bold' 
                                        : 'border-white/20 text-cream/60 hover:border-golden-orange'
                                    }`}
                                >
                                    <Shield size={10} /> Admin
                                </button>
                             </div>
                             <p className="text-[10px] text-cream/40 mt-2 italic text-center">
                                {selectedUser.role === 'Admin' ? 'Has full access to dashboard & settings.' : selectedUser.role === 'Collaborator' ? 'Has limited access to backend tools.' : 'Standard customer access only.'}
                             </p>
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
                            
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => toggleUserStatus(selectedUser.id, selectedUser.status)}
                                    className={`flex-1 flex items-center justify-center gap-2 h-10 text-sm font-bold uppercase tracking-widest border transition-colors ${
                                        selectedUser.status === 'Active' 
                                        ? 'border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10' 
                                        : 'border-green-500/50 text-green-400 hover:bg-green-500/10'
                                    }`}
                                >
                                    {selectedUser.status === 'Active' ? <><Ban size={14}/> Suspend</> : <><Check size={14}/> Activate</>}
                                </button>
                                
                                {selectedUser.status === 'Suspended' && (
                                    <button 
                                        onClick={() => handleDeleteUser(selectedUser.id)}
                                        className="flex-1 flex items-center justify-center gap-2 h-10 text-sm font-bold uppercase tracking-widest border border-red-500/50 text-red-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                                    >
                                        <Trash2 size={14}/> Delete
                                    </button>
                                )}
                            </div>
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
                        <p className="text-3xl text-cream font-serif font-bold">{registeredUsers.length}</p>
                    </div>
                     <div className="bg-[#1f0c05] p-6 border border-white/5 border-l-4 border-l-green-500">
                        <p className="text-cream/60 text-xs uppercase tracking-wide">Active Members</p>
                        <p className="text-3xl text-cream font-serif font-bold">{registeredUsers.filter(u => u.status === 'Active').length}</p>
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
                    <div className="p-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <h3 className="font-serif text-xl text-cream flex items-center gap-2"><Users size={20} className="text-golden-orange"/> User Activity & Behavior</h3>
                        
                        {/* Filters */}
                        <div className="flex gap-4">
                            <div className="relative">
                                <select 
                                    value={userRoleFilter}
                                    onChange={(e) => setUserRoleFilter(e.target.value)}
                                    className="bg-black/20 border border-white/10 text-cream text-sm pl-4 pr-8 py-2 focus:outline-none focus:border-golden-orange appearance-none rounded min-w-[150px]"
                                >
                                    <option value="All">All Roles</option>
                                    <option value="User">User</option>
                                    <option value="Collaborator">Collaborator</option>
                                    <option value="Admin">Admin</option>
                                </select>
                                <Filter size={14} className="absolute right-3 top-3 text-cream/40 pointer-events-none" />
                            </div>
                            <div className="relative">
                                <select 
                                    value={userStatusFilter}
                                    onChange={(e) => setUserStatusFilter(e.target.value)}
                                    className="bg-black/20 border border-white/10 text-cream text-sm pl-4 pr-8 py-2 focus:outline-none focus:border-golden-orange appearance-none rounded min-w-[150px]"
                                >
                                    <option value="All">All Statuses</option>
                                    <option value="Active">Active</option>
                                    <option value="Suspended">Suspended</option>
                                </select>
                                <Filter size={14} className="absolute right-3 top-3 text-cream/40 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-cream/80">
                            <thead className="bg-white/5 uppercase text-xs font-bold text-golden-orange">
                                <tr>
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4">Email</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4">Membership</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Last Active</th>
                                    <th className="px-6 py-4">Avg. Spend</th>
                                    <th className="px-6 py-4">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredUsers.map(u => (
                                    <tr key={u.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 font-bold">{u.name}</td>
                                        <td className="px-6 py-4">{u.email}</td>
                                        <td className="px-6 py-4">
                                            {u.role === 'Admin' && <span className="flex items-center gap-1 text-golden-orange"><Shield size={12}/> Admin</span>}
                                            {u.role === 'Collaborator' && <span className="flex items-center gap-1 text-blue-400"><Briefcase size={12}/> Collab</span>}
                                            {u.role === 'User' && <span className="text-cream/60">User</span>}
                                        </td>
                                        <td className="px-6 py-4"><span className="px-2 py-1 bg-white/10 rounded text-xs border border-white/10">{u.tier}</span></td>
                                        <td className="px-6 py-4">
                                            <span className={`flex items-center gap-1 ${u.status === 'Active' ? 'text-green-400' : 'text-red-400'}`}>
                                                <div className={`w-2 h-2 rounded-full ${u.status === 'Active' ? 'bg-green-400' : 'bg-red-400'}`}></div>
                                                {u.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs">{u.lastActive}</td>
                                        <td className="px-6 py-4 text-golden-orange">{u.avgSpend}</td>
                                        <td className="px-6 py-4 flex gap-2">
                                            <button onClick={() => setSelectedUser(u)} className="text-golden-orange hover:text-white underline">Details</button>
                                            
                                            {/* Quick Actions in Table */}
                                            {u.status === 'Suspended' && (
                                                <button 
                                                    onClick={() => handleDeleteUser(u.id)}
                                                    className="text-red-500 hover:text-red-300 ml-2"
                                                    title="Delete User"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {filteredUsers.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-8 text-center text-cream/50">No users match the selected filters.</td>
                                    </tr>
                                )}
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