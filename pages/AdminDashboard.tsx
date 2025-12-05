
import React, { useState } from 'react';
import { Users, Package, Megaphone, TrendingUp, DollarSign, Activity, AlertTriangle, Star, LogOut, X, Mail, Ban, Key, Check, Plus, Search, Trash2, Shield, UserCog, Briefcase, Filter, FileText, Save, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'analytics' | 'inventory' | 'marketing' | 'verifications'>('users');
  const { logout, registeredUsers, updateUserStatus, updateUserRole, updateUserNotes, deleteUser, approveVerification, rejectVerification } = useAuth();
  const navigate = useNavigate();

  // Filter for pending verifications
  const pendingVerifications = registeredUsers.filter(u => u.verificationStatus === 'Pending');

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="min-h-screen bg-espresso pt-8 pb-20 animate-fade-in relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-white/10 pb-6">
                <div>
                    <h1 className="font-serif text-4xl text-cream mt-2">Executive Dashboard</h1>
                    <p className="text-golden-orange text-xs uppercase tracking-widest mt-1">Platform Administration</p>
                </div>
                <div className="flex gap-2 flex-wrap mt-4 md:mt-0">
                    <button onClick={() => setActiveTab('users')} className={`px-4 py-2 rounded text-sm transition-colors ${activeTab === 'users' ? 'bg-golden-orange text-espresso font-bold' : 'text-cream hover:bg-white/5'}`}>Users</button>
                    <button onClick={() => setActiveTab('verifications')} className={`px-4 py-2 rounded text-sm relative transition-colors ${activeTab === 'verifications' ? 'bg-golden-orange text-espresso font-bold' : 'text-cream hover:bg-white/5'}`}>
                        Verifications
                        {pendingVerifications.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-bounce">{pendingVerifications.length}</span>}
                    </button>
                    <button onClick={() => setActiveTab('inventory')} className={`px-4 py-2 rounded text-sm transition-colors ${activeTab === 'inventory' ? 'bg-golden-orange text-espresso font-bold' : 'text-cream hover:bg-white/5'}`}>Inventory</button>
                    <Button variant="outline" onClick={handleLogout} className="text-xs h-9">Sign Out</Button>
                </div>
            </div>

            {/* VERIFICATIONS TAB */}
            {activeTab === 'verifications' && (
                <div>
                    <h2 className="font-serif text-2xl text-cream mb-6">Pending Verifications</h2>
                    {pendingVerifications.length === 0 ? (
                        <div className="bg-white/5 p-12 text-center border border-white/10">
                            <Check className="mx-auto text-green-400 mb-4 h-12 w-12 opacity-50"/>
                            <p className="text-cream/50 text-lg">All caught up! No pending verification requests.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {pendingVerifications.map(u => (
                                <div key={u.id} className="bg-white/5 p-6 border border-white/10 flex flex-col md:flex-row justify-between items-start gap-6 hover:border-golden-orange/30 transition-colors">
                                    <div className="flex-grow">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl text-cream font-bold">{u.name}</h3>
                                            <span className={`text-xs px-2 py-0.5 rounded border uppercase tracking-wide font-bold ${u.role === 'Partner' ? 'border-blue-400 text-blue-400' : 'border-golden-orange text-golden-orange'}`}>{u.role}</span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm text-cream/70 bg-black/20 p-4 rounded">
                                            {u.role === 'Partner' ? (
                                                <>
                                                    <p><span className="text-cream/40 uppercase text-xs mr-2">Business Name:</span> {u.verificationDocs?.businessName}</p>
                                                    <p><span className="text-cream/40 uppercase text-xs mr-2">CAC Number:</span> {u.verificationDocs?.cacNumber}</p>
                                                    <p><span className="text-cream/40 uppercase text-xs mr-2">Director BVN:</span> {u.verificationDocs?.bvn}</p>
                                                    <p className="text-green-400 font-bold flex items-center gap-1"><Check size={14}/> Registration Fee Paid (₦25,000)</p>
                                                </>
                                            ) : (
                                                <>
                                                    <p><span className="text-cream/40 uppercase text-xs mr-2">BVN:</span> {u.verificationDocs?.bvn}</p>
                                                    <p><span className="text-cream/40 uppercase text-xs mr-2">State:</span> {u.verificationDocs?.state}</p>
                                                    <p><span className="text-cream/40 uppercase text-xs mr-2">LGA:</span> {u.verificationDocs?.lga}</p>
                                                    <p className="text-golden-orange underline cursor-pointer">View Uploaded ID</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-row md:flex-col gap-2 min-w-[120px]">
                                        <button onClick={() => approveVerification(u.id)} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 text-sm font-bold rounded transition-colors shadow-lg">Approve</button>
                                        <button onClick={() => rejectVerification(u.id, 'Invalid Documents')} className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 text-sm font-bold rounded transition-colors shadow-lg">Reject</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* USERS TAB */}
            {activeTab === 'users' && (
                <div>
                     <h2 className="font-serif text-2xl text-cream mb-6">User Database</h2>
                     <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-cream/70">
                            <thead className="bg-white/5 uppercase text-xs tracking-wider text-golden-orange">
                                <tr>
                                    <th className="p-4">Name</th>
                                    <th className="p-4">Role</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Verification</th>
                                    <th className="p-4">Wallet</th>
                                    <th className="p-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {registeredUsers.map(u => (
                                    <tr key={u.id} className="hover:bg-white/5">
                                        <td className="p-4 font-bold text-white">{u.name}<br/><span className="text-xs text-cream/40 font-normal">{u.email}</span></td>
                                        <td className="p-4">{u.role}</td>
                                        <td className="p-4"><span className={`px-2 py-1 rounded text-xs ${u.status === 'Active' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>{u.status}</span></td>
                                        <td className="p-4">{u.verificationStatus}</td>
                                        <td className="p-4">${u.walletBalance}</td>
                                        <td className="p-4">
                                            <button onClick={() => deleteUser(u.id)} className="text-red-400 hover:text-red-300"><Trash2 size={16}/></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                     </div>
                </div>
            )}

             {/* INVENTORY TAB */}
            {activeTab === 'inventory' && (
                <div className="text-center py-20 bg-white/5 border border-white/10 border-dashed">
                    <Package className="mx-auto text-cream/20 mb-4 w-16 h-16"/>
                    <p className="text-cream/50">Inventory Management Module (Admin View)</p>
                </div>
            )}
        </div>
    </div>
  );
};
