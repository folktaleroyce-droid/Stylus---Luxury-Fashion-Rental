import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Diamond, ArrowRight, UserPlus, LogIn, Globe, Smartphone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';

export const Login: React.FC = () => {
  const location = useLocation();
  // Check if we came from a 'Join' link
  const initialMode = location.state?.mode !== 'signup';
  
  const [isLoginMode, setIsLoginMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Determine where to redirect after login (default to dashboard)
  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (location.state?.mode === 'signup') {
      setIsLoginMode(false);
    }
  }, [location.state]);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    processLogin(isLoginMode ? undefined : fullName);
  };

  const processLogin = (name?: string) => {
    setIsLoading(true);
    // Simulate network delay for effect
    setTimeout(() => {
      login(name);
      setIsLoading(false);
      navigate(from, { replace: true });
    }, 1500);
  };

  const handleSocialLogin = (provider: 'Google' | 'Apple') => {
      // Simulate social login flow
      const mockName = provider === 'Google' ? 'Alex Mercer' : 'Jordan Lee';
      processLogin(mockName);
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setEmail('');
    setPassword('');
    setFullName('');
  };

  return (
    <div className="min-h-screen bg-espresso flex items-center justify-center relative overflow-hidden animate-fade-in">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-golden-orange/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-golden-light/5 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-6 py-12">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
             <Diamond className="h-12 w-12 text-golden-orange" />
          </div>
          <h1 className="font-serif text-4xl text-cream mb-2">
            {isLoginMode ? 'Welcome Back' : 'Join Stylus'}
          </h1>
          <p className="text-golden-orange text-xs uppercase tracking-[0.2em]">
            {isLoginMode ? 'Enter the Inner Circle' : 'Create Your Account'}
          </p>
        </div>

        <div className="bg-[#1f0c05]/80 backdrop-blur-md border border-white/10 p-8 shadow-2xl rounded-sm">
          
          {/* Social Login Section */}
          <div className="space-y-3 mb-8">
            <button 
                onClick={() => handleSocialLogin('Google')}
                className="w-full flex items-center justify-center space-x-3 bg-white text-espresso font-bold py-3 hover:bg-cream transition-colors rounded-sm"
            >
                <Globe size={18} />
                <span className="text-sm uppercase tracking-wide">Continue with Google</span>
            </button>
             <button 
                onClick={() => handleSocialLogin('Apple')}
                className="w-full flex items-center justify-center space-x-3 bg-black text-white font-bold py-3 hover:bg-gray-900 transition-colors rounded-sm border border-white/10"
            >
                <Smartphone size={18} />
                <span className="text-sm uppercase tracking-wide">Continue with Apple</span>
            </button>
          </div>

          <div className="relative flex items-center justify-center mb-8">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
            </div>
            <span className="relative bg-[#1f0c05] px-4 text-xs text-cream/40 uppercase tracking-widest">Or via Email</span>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            
            {!isLoginMode && (
              <div className="animate-fade-in">
                <label className="block text-xs uppercase tracking-widest text-cream/60 mb-2">Full Name</label>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required={!isLoginMode}
                  className="w-full bg-white/5 border border-white/10 text-cream px-4 py-3 focus:outline-none focus:border-golden-orange transition-colors"
                  placeholder="Victoria Sterling"
                />
              </div>
            )}

            <div>
              <label className="block text-xs uppercase tracking-widest text-cream/60 mb-2">
                {isLoginMode ? 'Member ID / Email' : 'Email Address'}
              </label>
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
              {isLoading ? 'Processing...' : (
                <>
                  <span>{isLoginMode ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight size={16} className="ml-2" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center border-t border-white/5 pt-6">
            <p className="text-cream/50 text-sm mb-3">
              {isLoginMode ? 'New to Stylus?' : 'Already have an account?'}
            </p>
            <button 
              onClick={toggleMode} 
              className="w-full py-3 border border-white/20 text-cream hover:bg-golden-orange hover:text-espresso hover:border-golden-orange transition-all uppercase tracking-widest text-xs font-bold"
            >
              {isLoginMode ? (
                <span className="flex items-center justify-center">
                  Create Account <UserPlus size={14} className="ml-2" />
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  Sign In <LogIn size={14} className="ml-2" />
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};