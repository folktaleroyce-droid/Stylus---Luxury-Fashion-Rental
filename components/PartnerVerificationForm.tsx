
import React, { useState } from 'react';
import { Button } from './Button';
import { FileText, Upload, Building2, Check } from 'lucide-react';

interface PartnerVerificationFormProps {
    onSubmit: (data: any) => void;
}

export const PartnerVerificationForm: React.FC<PartnerVerificationFormProps> = ({ onSubmit }) => {
    const [cac, setCac] = useState('');
    const [bizName, setBizName] = useState('');
    const [bvn, setBvn] = useState('');
    const [certFile, setCertFile] = useState<File | null>(null);
    const [idFile, setIdFile] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<File | null>>) => {
        if (e.target.files && e.target.files[0]) setter(e.target.files[0]);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const cacCertUrl = certFile ? URL.createObjectURL(certFile) : 'https://images.unsplash.com/photo-1555601568-c9e61309063d?q=80&w=1000&auto=format&fit=crop';
        onSubmit({ cacNumber: cac, businessName: bizName, bvn, cacCertUrl });
    };
    
    return (
        <div className="bg-[#1f0c05] p-8 border border-golden-orange shadow-2xl rounded-sm">
            <h3 className="font-serif text-2xl text-cream mb-4">Partner Business Verification</h3>
            <p className="text-sm text-cream/60 mb-6">Strict verification required to list inventory. Please provide all business details.</p>
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-4 mb-6">
                    <div>
                        <label className="text-xs uppercase text-cream/50 mb-1 block">Registered Business Name</label>
                        <div className="relative">
                            <Building2 className="absolute left-3 top-3 text-cream/30" size={16}/>
                            <input required placeholder="Luxe Rentals Ltd" value={bizName} onChange={e => setBizName(e.target.value)} className="w-full bg-black/20 border border-white/10 text-cream pl-10 p-3 focus:border-golden-orange outline-none" />
                        </div>
                    </div>
                    <div>
                         <label className="text-xs uppercase text-cream/50 mb-1 block">CAC Registration Number</label>
                        <input required placeholder="RC Number" value={cac} onChange={e => setCac(e.target.value)} className="w-full bg-black/20 border border-white/10 text-cream p-3 focus:border-golden-orange outline-none" />
                    </div>
                    <div>
                         <label className="text-xs uppercase text-cream/50 mb-1 block">Director's BVN</label>
                        <input required placeholder="11-digit BVN" value={bvn} onChange={e => setBvn(e.target.value)} className="w-full bg-black/20 border border-white/10 text-cream p-3 focus:border-golden-orange outline-none" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="border-2 border-dashed border-white/10 p-4 text-center cursor-pointer hover:border-golden-orange/50 transition-colors bg-white/5 relative">
                            <input type="file" required onChange={(e) => handleFileChange(e, setCertFile)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*,application/pdf" />
                            <FileText className="mx-auto text-cream/40 mb-2" />
                            <span className="text-[10px] uppercase text-cream/60 flex items-center justify-center gap-1">
                                {certFile ? <><Check size={10}/> {certFile.name}</> : "CAC Certificate"}
                            </span>
                        </div>
                        <div className="border-2 border-dashed border-white/10 p-4 text-center cursor-pointer hover:border-golden-orange/50 transition-colors bg-white/5 relative">
                            <input type="file" required onChange={(e) => handleFileChange(e, setIdFile)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" />
                            <Upload className="mx-auto text-cream/40 mb-2" />
                             <span className="text-[10px] uppercase text-cream/60 flex items-center justify-center gap-1">
                                {idFile ? <><Check size={10}/> {idFile.name}</> : "Director's ID"}
                            </span>
                        </div>
                    </div>

                    <div className="bg-golden-orange/10 p-4 border border-golden-orange/30 text-center">
                        <p className="text-xs uppercase text-golden-orange font-bold mb-2">Registration Fee</p>
                        <p className="text-2xl font-serif text-cream">₦25,000</p>
                        <p className="text-[10px] text-cream/50 mt-1">Fee is mandatory for verification processing.</p>
                    </div>
                </div>
                <Button fullWidth>Pay & Submit Application</Button>
            </form>
        </div>
    );
};
