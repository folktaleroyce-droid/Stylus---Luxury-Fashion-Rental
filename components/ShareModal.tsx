
import React, { useState, useEffect } from 'react';
import { X, Share2, Download, Instagram, Twitter, Facebook, Sparkles, Loader2, Check } from 'lucide-react';
import { Button } from './Button';
import { generateShareCaption } from '../services/geminiService';
import { Product } from '../types';

interface ShareModalProps {
  mediaUrl: string;
  type: 'photo' | 'video';
  product: Product;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ mediaUrl, type, product, onClose }) => {
  const [caption, setCaption] = useState('Generating royal caption...');
  const [isGenerating, setIsGenerating] = useState(true);
  const [hasShared, setHasShared] = useState(false);

  useEffect(() => {
    const fetchCaption = async () => {
      const text = await generateShareCaption(product.name, product.brand);
      setCaption(text);
      setIsGenerating(false);
    };
    fetchCaption();
  }, [product]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        // Create a blob from the dataURL for sharing
        const res = await fetch(mediaUrl);
        const blob = await res.blob();
        const file = new File([blob], `stylus_metaverse_${Date.now()}.png`, { type: blob.type });

        await navigator.share({
          title: 'Stylus Virtual Try-On',
          text: caption,
          files: [file],
        });
        setHasShared(true);
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      // Fallback: Copy caption to clipboard
      navigator.clipboard.writeText(`${caption} ${mediaUrl}`);
      alert("Caption and link copied to clipboard for manual sharing.");
    }
  };

  const downloadMedia = () => {
    const link = document.createElement('a');
    link.href = mediaUrl;
    link.download = `stylus_royalty_${Date.now()}.${type === 'photo' ? 'png' : 'mp4'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 animate-fade-in">
      <div className="bg-espresso border border-golden-orange w-full max-w-4xl rounded-sm flex flex-col md:flex-row overflow-hidden shadow-[0_0_100px_rgba(225,175,77,0.15)]">
        
        {/* Media Preview Column */}
        <div className="w-full md:w-3/5 bg-black/40 flex items-center justify-center p-8 relative">
          <div className="absolute inset-0 border-[20px] border-espresso pointer-events-none z-10"></div>
          <div className="relative group">
            {type === 'photo' ? (
              <img src={mediaUrl} className="max-h-[70vh] w-auto shadow-2xl border border-white/10" alt="Virtual Try-On Capture" />
            ) : (
              <video src={mediaUrl} controls autoPlay loop className="max-h-[70vh] w-auto shadow-2xl border border-white/10" />
            )}
            <div className="absolute bottom-4 left-4 bg-espresso/80 backdrop-blur-md px-4 py-2 border border-golden-orange/30 text-golden-orange flex items-center gap-2">
                <DiamondLogo className="w-4 h-4" />
                <span className="text-[10px] font-bold tracking-[0.2em]">STYLUS METAVERSE</span>
            </div>
          </div>
        </div>

        {/* Share Options Column */}
        <div className="w-full md:w-2/5 p-8 flex flex-col justify-between bg-espresso">
          <div>
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="font-serif text-2xl text-cream">Share Your Look</h3>
                <p className="text-golden-orange text-xs uppercase tracking-widest mt-1">Editorial Preview</p>
              </div>
              <button onClick={onClose} className="p-2 text-cream/50 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="mb-8">
              <label className="text-[10px] text-cream/40 uppercase tracking-widest font-bold mb-2 block flex items-center gap-2">
                <Sparkles size={12}/> AI-Generated Concierge Caption
              </label>
              <div className="bg-white/5 border border-white/10 p-4 rounded-sm relative min-h-[100px] flex items-center">
                {isGenerating ? (
                  <div className="flex items-center gap-2 text-cream/40 italic text-sm">
                    <Loader2 size={16} className="animate-spin" /> Consulting the archives...
                  </div>
                ) : (
                  <textarea 
                    value={caption} 
                    onChange={(e) => setCaption(e.target.value)}
                    className="w-full bg-transparent text-cream/80 text-sm leading-relaxed focus:outline-none resize-none h-24"
                  />
                )}
              </div>
            </div>

            <div className="space-y-3">
              <button onClick={handleShare} className="w-full bg-golden-orange text-espresso py-4 font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-white transition-all shadow-lg">
                {hasShared ? <><Check size={16}/> Shared Successfully</> : <><Share2 size={16}/> Share Now</>}
              </button>
              <button onClick={downloadMedia} className="w-full border border-white/20 text-cream py-4 font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-white/5 transition-all">
                <Download size={16}/> Save to Device
              </button>
            </div>
          </div>

          <div className="mt-12 flex justify-center gap-6">
             <button className="text-cream/40 hover:text-golden-orange transition-colors"><Instagram size={20}/></button>
             <button className="text-cream/40 hover:text-golden-orange transition-colors"><Twitter size={20}/></button>
             <button className="text-cream/40 hover:text-golden-orange transition-colors"><Facebook size={20}/></button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DiamondLogo = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 3h12l4 9-10 10L2 12z"></path>
        <path d="M11 3l-4 9 5 8 5-8-4-9"></path>
        <path d="M2 12h20"></path>
    </svg>
);
