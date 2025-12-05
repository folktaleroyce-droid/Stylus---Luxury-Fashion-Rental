import React, { useState } from 'react';
import { Button } from './Button';
import { Upload } from 'lucide-react';

interface UserVerificationFormProps {
    onSubmit: (data: any) => void;
}

export const UserVerificationForm: React.FC<UserVerificationFormProps> = ({ onSubmit }) => {
    const [bvn, setBvn] = useState('');
    const [state, setState] = useState('');
    const [lga, setLga] = useState('');
    const [idFile, setIdFile] = useState<File | null>(null);
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) setIdFile(e.target.files[0]);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Create a fake URL for the uploaded file for demo purposes
        const govIdUrl = idFile ? URL.createObjectURL(idFile) : 'https://images.unsplash.com/photo-1633265486064-084b2195299b?q=80&w=1000&auto=format&fit=crop';
        onSubmit({ bvn, state, lga, govIdUrl });
    };
    
    return (
        <div className="bg-[#1f0c05] p-8 border border-golden-orange shadow-2xl rounded-sm">
            <h3 className="font-serif text-2xl text-cream mb-4">Identity Verification</h3>
            <p className="text-sm text-cream/60 mb-6">To ensure the security of our luxury assets, we require government ID verification before you can rent or buy.</p>
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-4 mb-6">
                    <div>
                        <label className="text-xs uppercase text-cream/50 mb-1 block">BVN (11 Digits)</label>
                        <input required placeholder="Enter BVN" value={bvn} onChange={e => setBvn(e.target.value)} className="w-full bg-black/20 border border-white/10 text-cream p-3 focus:border-golden-orange outline-none" />
                    </div>
                    <div>
                        <label className="text-xs uppercase text-cream/50 mb-1 block">State of Residence</label>
                        <input required placeholder="e.g. Lagos" value={state} onChange={e => setState(e.target.value)} className="w-full bg-black/20 border border-white/10 text-cream p-3 focus:border-golden-orange outline-none" />
                    </div>
                    <div>
                        <label className="text-xs uppercase text-cream/50 mb-1 block">LGA</label>
                        <input required placeholder="e.g. Eti-Osa" value={lga} onChange={e => setLga(e.target.value)} className="w-full bg-black/20 border border-white/10 text-cream p-3 focus:border-golden-orange outline-none" />
                    </div>
                    <div className="border-2 border-dashed border-white/10 p-6 text-center cursor-pointer hover:border-golden-orange/50 transition-colors bg-white/5 relative">
                        <input type="file" required onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" />
                        <Upload className="mx-auto text-cream/40 mb-2" />
                        <span className="text-xs uppercase text-cream/60">{idFile ? idFile.name : "Upload Valid ID (NIN/Passport)"}</span>
                    </div>
                </div>
                <Button fullWidth>Submit Verification</Button>
            </form>
        </div>
    );
};