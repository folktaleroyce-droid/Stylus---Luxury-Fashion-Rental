import React from 'react';
import { AIStylist } from '../components/AIStylist';

export const AIStylistPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-espresso flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8 animate-fade-in">
        <h1 className="font-serif text-4xl text-cream mb-2">The Concierge</h1>
        <p className="text-golden-orange uppercase tracking-widest text-sm">Artificial Intelligence. Timeless Style.</p>
      </div>
      <AIStylist />
    </div>
  );
};