import React from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { Button } from '../components/Button';

export const Contact: React.FC = () => {
  return (
    <div className="min-h-screen bg-espresso pt-12 pb-24 animate-fade-in">
       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="text-center mb-16">
              <span className="text-golden-orange uppercase tracking-[0.2em] text-xs">Get in Touch</span>
              <h1 className="font-serif text-4xl md:text-5xl text-cream mt-4">Contact Concierge</h1>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
               
               {/* Contact Form */}
               <div className="bg-[#1f0c05] p-8 md:p-12 border border-white/5 shadow-2xl">
                   <h2 className="font-serif text-2xl text-cream mb-6">Send us a message</h2>
                   <form className="space-y-6">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div>
                               <label className="text-xs text-cream/50 uppercase tracking-widest mb-2 block">Name</label>
                               <input type="text" className="w-full bg-black/20 border border-white/10 p-3 text-cream focus:border-golden-orange outline-none" placeholder="Victoria Sterling" />
                           </div>
                           <div>
                               <label className="text-xs text-cream/50 uppercase tracking-widest mb-2 block">Email</label>
                               <input type="email" className="w-full bg-black/20 border border-white/10 p-3 text-cream focus:border-golden-orange outline-none" placeholder="vip@stylus.com" />
                           </div>
                       </div>
                       <div>
                           <label className="text-xs text-cream/50 uppercase tracking-widest mb-2 block">Subject</label>
                           <select className="w-full bg-black/20 border border-white/10 p-3 text-cream focus:border-golden-orange outline-none">
                               <option>General Inquiry</option>
                               <option>Rental Assistance</option>
                               <option>Stylist Consultation</option>
                               <option>Partnership</option>
                           </select>
                       </div>
                       <div>
                           <label className="text-xs text-cream/50 uppercase tracking-widest mb-2 block">Message</label>
                           <textarea rows={5} className="w-full bg-black/20 border border-white/10 p-3 text-cream focus:border-golden-orange outline-none" placeholder="How can we assist you today?"></textarea>
                       </div>
                       <Button fullWidth className="flex items-center justify-center gap-2">Send Message <Send size={16}/></Button>
                   </form>
               </div>

               {/* Info */}
               <div className="flex flex-col justify-center space-y-12">
                   <div>
                       <h3 className="font-serif text-2xl text-cream mb-6 border-l-4 border-golden-orange pl-4">Headquarters</h3>
                       <div className="flex items-start gap-4 text-cream/80 mb-4">
                           <MapPin className="text-golden-orange shrink-0" />
                           <p>125 5th Avenue, Penthouse Suite<br/>New York, NY 10010<br/>United States</p>
                       </div>
                   </div>
                   
                   <div>
                       <h3 className="font-serif text-2xl text-cream mb-6 border-l-4 border-golden-orange pl-4">Direct Lines</h3>
                       <div className="space-y-4">
                           <div className="flex items-center gap-4 text-cream/80">
                               <Phone className="text-golden-orange shrink-0" />
                               <p>+1 (888) STYLUS-VIP</p>
                           </div>
                           <div className="flex items-center gap-4 text-cream/80">
                               <Mail className="text-golden-orange shrink-0" />
                               <p>concierge@stylus.com</p>
                           </div>
                       </div>
                   </div>

                   <div className="p-8 bg-white/5 border border-golden-orange/20">
                       <p className="font-serif text-xl text-golden-orange mb-2">Concierge Hours</p>
                       <p className="text-cream/60 text-sm">Mon - Fri: 8am - 8pm EST<br/>Sat - Sun: 10am - 6pm EST</p>
                   </div>
               </div>

           </div>
       </div>
    </div>
  );
};