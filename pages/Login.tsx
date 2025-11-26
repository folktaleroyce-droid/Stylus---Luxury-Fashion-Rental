import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Diamond, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine where to redirect after login (default to dashboard)
  const from = location.state?.from?.pathname || '/dashboard';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate network delay for effect
    setTimeout(() => {
      login();
      setIsLoading(false);
      navigate(from, { replace: true });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-espresso flex items-center justify-center relative overflow-hidden animate-fade-in">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-golden-orange/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-golden-light/5 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
             <Diamond className="h-12 w-12 text-golden-orange" />
          </div>
          <h1 className="font-serif text-4xl text-cream mb-2">Welcome Back</h1>
          <p className="text-golden-orange text-xs uppercase tracking-[0.2em]">Enter the Inner Circle</p>
        </div>

        <div className="bg-[#1f0c05]/80 backdrop-blur-md border border-white/10 p-8 shadow-2xl rounded-sm">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs uppercase tracking-widest text-cream/60 mb-2">Member ID / Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 text-cream px-4 py-3 focus:outline-none focus:border-golden-orange transition-colors"
                placeholder="vip@stylus.com"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-cream/60 mb-2">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 text-cream px-4 py-3 focus:outline-none focus:border-golden-orange transition-colors"
                placeholder="••••••••"
              />
            </div>

            <Button fullWidth disabled={isLoading} className="mt-8 flex items-center justify-center">
              {isLoading ? 'Authenticating...' : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={16} className="ml-2" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center border-t border-white/5 pt-6">
            <p className="text-cream/40 text-xs mb-2">Not a member?</p>
            <button onClick={() => alert("Membership is currently by invitation only.")} className="text-golden-orange text-xs uppercase tracking-widest hover:text-white transition-colors border-b border-transparent hover:border-white pb-1">
              Request Invitation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};