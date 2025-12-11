
import React, { useState, useEffect } from 'react';
import { X, CreditCard, Lock, ShieldCheck, Loader2, CheckCircle, AlertCircle, ChevronRight } from 'lucide-react';
import { Button } from './Button';
import { PaymentService, PaymentRequest } from '../services/payment';

interface PaymentModalProps {
  amount: number;
  description: string;
  userId: string;
  onSuccess: (transactionId: string) => void;
  onClose: () => void;
}

type PaymentStatus = 'idle' | 'secure_init' | 'processing' | 'success' | 'error';

export const PaymentModal: React.FC<PaymentModalProps> = ({ amount, description, userId, onSuccess, onClose }) => {
  const [status, setStatus] = useState<PaymentStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const parts = [];
    for (let i = 0; i < v.length; i += 4) {
      parts.push(v.substr(i, 4));
    }
    return parts.length > 1 ? parts.join(' ') : value;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'number') {
        setCardDetails(prev => ({ ...prev, [name]: formatCardNumber(value) }));
    } else {
        setCardDetails(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    
    // 1. Initialize Secure Session
    setStatus('secure_init');
    try {
        await PaymentService.initializeSession();
        
        // 2. Process Payment
        setStatus('processing');
        
        const request: PaymentRequest = {
            amount,
            currency: 'USD',
            description,
            userId,
            paymentMethod: cardDetails
        };

        const response = await PaymentService.processPayment(request);

        if (response.success && response.transactionId) {
            setStatus('success');
            setTimeout(() => {
                onSuccess(response.transactionId!);
            }, 1500);
        } else {
            setStatus('error');
            setErrorMsg(response.error || "Transaction failed. Please try again.");
        }

    } catch (err) {
        setStatus('error');
        setErrorMsg("Network error. Unable to reach payment gateway.");
    }
  };

  if (status === 'success') {
      return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-[#1f0c05] border border-green-500 w-full max-w-md p-8 text-center rounded-sm shadow-[0_0_50px_rgba(34,197,94,0.2)]">
                <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-6 text-white animate-bounce">
                    <CheckCircle size={32} />
                </div>
                <h3 className="font-serif text-3xl text-cream mb-2">Payment Confirmed</h3>
                <p className="text-cream/60 mb-6">Transaction successful. Redirecting...</p>
                <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 animate-slide-right w-full origin-left"></div>
                </div>
            </div>
        </div>
      );
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-[#1f0c05] border border-golden-orange w-full max-w-lg relative shadow-2xl rounded-sm overflow-hidden">
        
        {/* Header */}
        <div className="bg-white/5 p-6 border-b border-white/10 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <Lock size={18} className="text-green-400" />
                <span className="text-xs uppercase tracking-widest text-cream font-bold">Secure Checkout</span>
            </div>
            <button onClick={onClose} disabled={status === 'processing'} className="text-cream/50 hover:text-white disabled:opacity-30">
                <X size={20} />
            </button>
        </div>

        <div className="p-8">
            <div className="text-center mb-8">
                <p className="text-xs text-cream/50 uppercase mb-2">Total Amount</p>
                <p className="text-4xl font-serif text-golden-orange">${amount.toFixed(2)}</p>
                <p className="text-xs text-cream/40 mt-2 italic">{description}</p>
            </div>

            {status === 'error' && (
                <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded flex items-center gap-3 text-red-400 text-sm">
                    <AlertCircle size={18} />
                    {errorMsg}
                </div>
            )}

            {status === 'processing' || status === 'secure_init' ? (
                <div className="py-12 text-center">
                    <Loader2 size={48} className="mx-auto text-golden-orange animate-spin mb-4" />
                    <p className="text-sm text-cream font-bold uppercase tracking-widest mb-1">
                        {status === 'secure_init' ? 'Securing Connection...' : 'Processing Payment...'}
                    </p>
                    <p className="text-xs text-cream/40">Please do not close this window.</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="text-xs text-cream/50 mb-1 block uppercase font-bold">Card Number</label>
                        <div className="relative">
                            <CreditCard className="absolute left-3 top-3 text-cream/30" size={18}/>
                            <input 
                                required
                                name="number"
                                placeholder="0000 0000 0000 0000"
                                value={cardDetails.number}
                                onChange={handleInputChange}
                                maxLength={19}
                                className="w-full bg-black/20 border border-white/10 pl-10 p-3 text-cream focus:border-golden-orange outline-none font-mono" 
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-cream/50 mb-1 block uppercase font-bold">Expiry</label>
                            <input 
                                required
                                name="expiry"
                                placeholder="MM / YY"
                                value={cardDetails.expiry}
                                onChange={handleInputChange}
                                maxLength={5}
                                className="w-full bg-black/20 border border-white/10 p-3 text-cream focus:border-golden-orange outline-none text-center" 
                            />
                        </div>
                        <div>
                            <label className="text-xs text-cream/50 mb-1 block uppercase font-bold">CVC / CVV</label>
                            <div className="relative">
                                <Lock className="absolute right-3 top-3 text-cream/30" size={14}/>
                                <input 
                                    required
                                    name="cvv"
                                    type="password"
                                    placeholder="123"
                                    value={cardDetails.cvv}
                                    onChange={handleInputChange}
                                    maxLength={4}
                                    className="w-full bg-black/20 border border-white/10 p-3 text-cream focus:border-golden-orange outline-none text-center" 
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs text-cream/50 mb-1 block uppercase font-bold">Cardholder Name</label>
                        <input 
                            required
                            name="name"
                            placeholder="NAME ON CARD"
                            value={cardDetails.name}
                            onChange={handleInputChange}
                            className="w-full bg-black/20 border border-white/10 p-3 text-cream focus:border-golden-orange outline-none uppercase" 
                        />
                    </div>

                    <div className="pt-4">
                        <Button fullWidth className="flex justify-center items-center gap-2">
                            Pay ${amount.toFixed(2)} <ChevronRight size={16} />
                        </Button>
                        <div className="flex justify-center items-center gap-2 mt-4 text-[10px] text-cream/30 uppercase">
                            <ShieldCheck size={12} />
                            <span>AES-256 Bit Encryption</span>
                        </div>
                    </div>
                </form>
            )}
        </div>
      </div>
    </div>
  );
};
