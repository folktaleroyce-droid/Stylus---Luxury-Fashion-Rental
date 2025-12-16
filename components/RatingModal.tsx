import React, { useState } from 'react';
import { Star, X } from 'lucide-react';
import { Button } from './Button';

interface RatingModalProps {
    partnerName: string;
    itemTitle: string;
    onClose: () => void;
    onSubmit: (rating: number, comment: string) => void;
}

export const RatingModal: React.FC<RatingModalProps> = ({ partnerName, itemTitle, onClose, onSubmit }) => {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) return alert("Please select a star rating");
        onSubmit(rating, comment);
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-[#1f0c05] border border-golden-orange w-full max-w-md p-6 relative rounded-sm shadow-2xl">
                <button onClick={onClose} className="absolute top-4 right-4 text-cream/50 hover:text-white"><X size={20}/></button>
                <h3 className="font-serif text-2xl text-cream mb-1">Rate Experience</h3>
                <p className="text-xs text-cream/50 uppercase tracking-widest mb-6">Partner: {partnerName}</p>
                
                <div className="mb-6 bg-white/5 p-3 rounded-sm border border-white/5">
                    <p className="text-sm text-cream font-bold">{itemTitle}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex justify-center gap-2 mb-4">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                className="transition-transform hover:scale-110 focus:outline-none"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHover(star)}
                                onMouseLeave={() => setHover(rating)}
                            >
                                <Star 
                                    size={32} 
                                    className={`${star <= (hover || rating) ? 'fill-golden-orange text-golden-orange' : 'text-cream/20'}`} 
                                />
                            </button>
                        ))}
                    </div>

                    <div>
                        <label className="text-xs uppercase text-cream/50 mb-2 block">Review (Optional)</label>
                        <textarea 
                            rows={3}
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                            placeholder="Share your experience..."
                            className="w-full bg-black/20 border border-white/10 p-3 text-cream focus:border-golden-orange outline-none resize-none"
                        />
                    </div>

                    <Button fullWidth>Submit Rating</Button>
                </form>
            </div>
        </div>
    );
};