
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Diamond, ArrowRight, Globe, Eye, EyeOff, Briefcase, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { Role } from '../types';

export const Login: React.FC = () => {
  const location = useLocation();
  const initialMode = location.state?.mode !== 'signup';
  
  const [isLoginMode, setIsLoginMode] = useState(initialMode);
  const [selectedRole, setSelectedRole] = useState<Role>('User'); // For signup
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, registerUser } = useAuth();
  const navigate = useNavigate();

  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (location.state?.mode === 'signup') {
      setIsLoginMode(false);
    }
  }, [location.state]);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) return;

    // Validation for Signup
    if (!isLoginMode && password !== confirmPassword) {
        alert("Passwords do not match. Please try again.");
        return;
    }

    setIsLoading(true);
    
    setTimeout(() => {
      if (!isLoginMode) {
        // Register flow
        registerUser(fullName, email, selectedRole);
        // Then login
        login(fullName); // Simplified for demo
      } else {
        // Login flow
        const success = login(email, password);
        if (!success) {
            alert("Invalid credentials. For default accounts use username 'Stylus'.");
            setIsLoading(false);
            return;
        }
      }
      
      setIsLoading(false);
      navigate(from, { replace: true });
    }, 1500);
  };

  const handleSocialLogin = (provider: 'Google' | 'Apple') => {
      // Mock social login always as User for simplicity
      const mockName = provider === 'Google' ? 'Alex Mercer' : 'Jordan Lee';
      const mockEmail = provider === 'Google' ? 'alex.m@gmail.com' : 'jordan.l@icloud.com';
      
      setIsLoading(true);
      setTimeout(() => {
          if (!isLoginMode) {
             registerUser(mockName, mockEmail, 'User');
          }
          login(mockName);
          setIsLoading(false);
          navigate(from, { replace: true });
      }, 1000);
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
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
          
          {!isLoginMode && (
              <div className="flex mb-6 bg-black/20 p-1 rounded">
                  <button 
                    type="button" 
                    onClick={() => setSelectedRole('User')}
                    className={`flex-1 py-2 text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 rounded transition-all ${selectedRole === 'User' ? 'bg-golden-orange text-espresso shadow-lg' : 'text-cream/50 hover:text-white'}`}
                  >
                      <User size={14} /> User
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setSelectedRole('Partner')}
                    className={`flex-1 py-2 text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 rounded transition-all ${selectedRole === 'Partner' ? 'bg-golden-orange text-espresso shadow-lg' : 'text-cream/50 hover:text-white'}`}
                  >
                      <Briefcase size={14} /> Partner
                  </button>
              </div>
          )}

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
                <label className="block text-xs uppercase tracking-widest text-cream/50 mb-2">Username / Email</label>
                <input 
                    type="text" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 text-cream px-4 py-3 focus:border-golden-orange outline-none transition-colors"
                    placeholder={isLoginMode ? "Enter 'Stylus' for demo accounts" : "email@example.com"}
                    required
                />
            </div>

            <div className="relative">
                <div className="flex justify-between mb-2">
                    <label className="block text-xs uppercase tracking-widest text-cream/50">Password</label>
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

            {!isLoginMode && (
                <div className="relative">
                    <label className="block text-xs uppercase tracking-widest text-cream/50 mb-2">Confirm Password</label>
                    <input 
                        type={showPassword ? "text" : "password"} 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 text-cream px-4 py-3 focus:border-golden-orange outline-none transition-colors"
                        required
                    />
                </div>
            )}

            <Button fullWidth disabled={isLoading} className="mt-4">
                {isLoading ? (
                    <span className="animate-pulse">Processing...</span>
                ) : (
                    <span className="flex items-center justify-center gap-2">
                        {isLoginMode ? 'Sign In' : selectedRole === 'Partner' ? 'Register Partner' : 'Create Account'} <ArrowRight size={16} />
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
            {isLoginMode && (
                <div className="mt-4 text-[10px] text-cream/30 bg-black/20 p-2 rounded border border-white/5">
                    <p className="font-bold mb-1">Demo Credentials (Username: Stylus)</p>
                    <p>User Pass: StylusUser#4829</p>
                    <p>Partner Pass: StylusPartner@9931</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
