import React from 'react';
import { ShieldCheck, FileText, Sparkles, Lock, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';

interface InfoPageProps {
  type: 'privacy' | 'terms' | 'authenticity' | 'edit' | 'bag';
}

export const InfoPage: React.FC<InfoPageProps> = ({ type }) => {
  const content = {
    privacy: {
      title: 'Privacy Policy',
      icon: <Lock className="w-12 h-12 text-golden-orange mb-6" />,
      text: (
        <>
          <p className="mb-6">At Stylus, we believe privacy is the ultimate luxury. We are committed to protecting your personal information with the same rigor we apply to authenticating our collection.</p>
          <h3 className="text-xl font-serif text-cream mb-4">1. Information Collection</h3>
          <p className="mb-6">We collect only the necessary data to facilitate your premium rental experience, including identity verification documents and secure payment tokens.</p>
          <h3 className="text-xl font-serif text-cream mb-4">2. Data Security</h3>
          <p className="mb-6">Your data is encrypted using banking-grade security protocols. We never sell your personal information to third parties.</p>
        </>
      )
    },
    terms: {
      title: 'Terms of Service',
      icon: <FileText className="w-12 h-12 text-golden-orange mb-6" />,
      text: (
        <>
          <p className="mb-6">Welcome to the Stylus inner circle. By accessing our platform, you agree to uphold the standards of our community.</p>
          <h3 className="text-xl font-serif text-cream mb-4">1. Rental Agreement</h3>
          <p className="mb-6">All items remain the property of Stylus or our partners. You agree to return items in the condition they were received, accounting for minor wear and tear.</p>
          <h3 className="text-xl font-serif text-cream mb-4">2. Late Fees</h3>
          <p className="mb-6">To ensure availability for all members, late returns incur a daily fee equivalent to 20% of the rental price.</p>
        </>
      )
    },
    authenticity: {
      title: 'Authenticity Guarantee',
      icon: <ShieldCheck className="w-12 h-12 text-golden-orange mb-6" />,
      text: (
        <>
          <p className="mb-6">True luxury allows for no compromises. Every item in the Stylus collection undergoes a rigorous multi-point inspection process.</p>
          <h3 className="text-xl font-serif text-cream mb-4">The Verification Process</h3>
          <p className="mb-6">Our expert authenticators verify provenance, materials, stitching, and hardware. We also utilize AI-driven analysis to compare items against a global database of luxury goods.</p>
          <p className="mb-6">We guarantee the authenticity of every item, or 100% of your money back plus a complimentary month of Diamond membership.</p>
        </>
      )
    },
    edit: {
      title: 'The Edit',
      icon: <Sparkles className="w-12 h-12 text-golden-orange mb-6" />,
      text: (
        <>
          <p className="text-xl text-golden-orange font-serif italic mb-8">Curated insights for the modern connoisseur.</p>
          
          <div className="grid gap-8">
            <div className="bg-white/5 p-8 border-l-2 border-golden-orange">
              <h3 className="text-2xl font-serif text-cream mb-2">Trend Report: Velvet Revival</h3>
              <p className="text-cream/70 mb-4">Why the fabric of royalty is dominating this season's gala circuit.</p>
              <Link to="/catalog" className="text-xs uppercase tracking-widest text-golden-orange hover:text-white">Shop Velvet &rarr;</Link>
            </div>

            <div className="bg-white/5 p-8 border-l-2 border-golden-orange">
              <h3 className="text-2xl font-serif text-cream mb-2">Styling Guide: Black Tie Optional</h3>
              <p className="text-cream/70 mb-4">Navigating the nuances of modern formal wear with effortless sophistication.</p>
              <Link to="/ai-stylist" className="text-xs uppercase tracking-widest text-golden-orange hover:text-white">Ask the Stylist &rarr;</Link>
            </div>
          </div>
        </>
      )
    },
    bag: {
      title: 'Shopping Bag',
      icon: <ShoppingBag className="w-12 h-12 text-golden-orange mb-6" />,
      text: (
        <>
           <p className="mb-6 text-xl font-light">Your shopping bag is currently empty.</p>
           <p className="mb-8 text-cream/60">Explore our curated collection to find your next statement piece.</p>
           <Link to="/catalog">
             <Button>Explore Collection</Button>
           </Link>
        </>
      )
    }
  };

  const current = content[type];

  return (
    <div className="min-h-screen bg-espresso pt-20 pb-20 animate-fade-in">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex justify-center">
          {current.icon}
        </div>
        <h1 className="font-serif text-5xl text-cream mb-12">{current.title}</h1>
        
        <div className="text-left bg-[#1f0c05] p-10 border border-white/5 shadow-2xl rounded-sm flex flex-col items-center text-center">
          <div className="text-cream/80 leading-relaxed text-lg font-light w-full">
            {current.text}
          </div>
        </div>

        {type !== 'bag' && (
          <div className="mt-12">
            <Link to="/">
              <Button variant="outline">Return Home</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};