import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Diamond, ArrowRight, Globe, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';

export const Login: React.FC = () => {
  const location = useLocation();
  const initialMode = location.state?.mode !== 'signup';
  
  const [isLoginMode, setIsLoginMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (location.state?.mode === 'signup') {
      setIsLoginMode(false);
    }
  }, [location.state]);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check for Admin Credentials
    if (email === 'Stylus' && password === 'Sty!usAdm1n#29XQ') {
      processLogin('Stylus Admin', true);
      return;
    }

    // Regular user login simulation
    if (!email || !password) return;
    processLogin(isLoginMode ? undefined : fullName, false);
  };

  const processLogin = (name?: string, isAdmin: boolean = false) => {
    setIsLoading(true);
    setTimeout(() => {
      login(name, isAdmin);
      setIsLoading(false);
      if (isAdmin) {
        navigate('/admin', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    }, 1500);
  };

  const handleSocialLogin = (provider: 'Google' | 'Apple') => {
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
          
          <div className="space-y-3 mb-8">
            <button 
                onClick={() => handleSocialLogin('Google')}
                className="w-full flex items-center justify-center space-x-3 bg-white text-espresso font-bold py-3 hover:bg-cream transition-colors"
            >
                <Globe size={18} />
                <span className="text-xs uppercase tracking-widest">Continue with Google</span>
            </button>
          </div>

          <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest">
                  <span className="bg-[#1f0c05] px-2 text-cream/40">Or continue with email</span>
              </div>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            {!isLoginMode && (
                <div>
                    <label className="block text-xs uppercase tracking-widest text-cream/50 mb-2">Full Name</label>
                    <input 
                        type="text" 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 text-cream px-4 py-3 focus:border-golden-orange outline-none transition-colors"
                        required={!isLoginMode}
                    />
                </div>
            )}
            
            <div>
                <label className="block text-xs uppercase tracking-widest text-cream/50 mb-2">Email or Username</label>
                <input 
                    type="text" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 text-cream px-4 py-3 focus:border-golden-orange outline-none transition-colors"
                    required
                />
            </div>

            <div className="relative">
                <div className="flex justify-between mb-2">
                    <label className="block text-xs uppercase tracking-widest text-cream/50">Password</label>
                    {isLoginMode && <a href="#" className="text-xs text-golden-orange hover:text-white transition-colors">Forgot?</a>}
                </div>
                <input 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 text-cream px-4 py-3 focus:border-golden-orange outline-none transition-colors"
                    required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[34px] text-cream/30 hover:text-cream transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
            </div>

            <Button fullWidth disabled={isLoading} className="mt-4">
                {isLoading ? (
                    <span className="animate-pulse">Authenticating...</span>
                ) : (
                    <span className="flex items-center justify-center gap-2">
                        {isLoginMode ? 'Sign In' : 'Create Account'} <ArrowRight size={16} />
                    </span>
                )}
            </Button>
          </form>
        </div>

        <div className="text-center mt-8">
            <p className="text-cream/60 text-sm">
                {isLoginMode ? "Not a member yet? " : "Already have an account? "}
                <button onClick={toggleMode} className="text-golden-orange font-bold hover:text-white transition-colors border-b border-golden-orange hover:border-white pb-0.5">
                    {isLoginMode ? "Request Access" : "Log In"}
                </button>
            </p>
        </div>
      </div>
    </div>
  );
};