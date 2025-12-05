import React, { useState } from 'react';
import { Button } from './Button';
import { FileText, Upload } from 'lucide-react';

interface PartnerVerificationFormProps {
    onSubmit: (data: any) => void;
}

export const PartnerVerificationForm: React.FC<PartnerVerificationFormProps> = ({ onSubmit }) => {
    const [cac, setCac] = useState('');
    const [bizName, setBizName] = useState('');
    const [bvn, setBvn] = useState('');
    const [certFile, setCertFile] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) setCertFile(e.target.files[0]);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Fake URL for demo
        const cacCertUrl = certFile ? URL.createObjectURL(certFile) : 'https://images.unsplash.com/photo-1555601568-c9e61309063d?q=80&w=1000&auto=format&fit=crop';
        onSubmit({ cacNumber: cac, businessName: bizName, bvn, cacCertUrl });
    };
    
    return (
        <div className="bg-[#1f0c05] p-8 border border-golden-orange shadow-2xl rounded-sm">
            <h3 className="font-serif text-2xl text-cream mb-4">Partner Business Verification</h3>
            <p className="text-sm text-cream/60 mb-6">Complete your business registration to start listing items. Admins will verify your documents.</p>
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-4 mb-6">
                    <div>
                        <label className="text-xs uppercase text-cream/50 mb-1 block">Business Name</label>
                        <input required placeholder="Registered Business Name" value={bizName} onChange={e => setBizName(e.target.value)} className="w-full bg-black/20 border border-white/10 text-cream p-3 focus:border-golden-orange outline-none" />
                    </div>
                    <div>
                         <label className="text-xs uppercase text-cream/50 mb-1 block">CAC Number</label>
                        <input required placeholder="RC Number" value={cac} onChange={e => setCac(e.target.value)} className="w-full bg-black/20 border border-white/10 text-cream p-3 focus:border-golden-orange outline-none" />
                    </div>
                    <div>
                         <label className="text-xs uppercase text-cream/50 mb-1 block">Director BVN</label>
                        <input required placeholder="Director BVN" value={bvn} onChange={e => setBvn(e.target.value)} className="w-full bg-black/20 border border-white/10 text-cream p-3 focus:border-golden-orange outline-none" />
                    </div>
                    <div className="border-2 border-dashed border-white/10 p-6 text-center cursor-pointer hover:border-golden-orange/50 transition-colors bg-white/5 relative">
                        <input type="file" required onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*,application/pdf" />
                        <FileText className="mx-auto text-cream/40 mb-2" />
                        <span className="text-xs uppercase text-cream/60">{certFile ? certFile.name : "Upload CAC Certificate"}</span>
                    </div>
                    <div className="bg-golden-orange/10 p-4 border border-golden-orange/30 text-center">
                        <p className="text-xs uppercase text-golden-orange font-bold mb-2">Registration Fee</p>
                        <p className="text-2xl font-serif text-cream">₦25,000</p>
                        <p className="text-[10px] text-cream/50 mt-1">One-time payment deducted from wallet or paid via card</p>
                    </div>
                </div>
                <Button fullWidth>Pay & Submit</Button>
            </form>
        </div>
    );
};