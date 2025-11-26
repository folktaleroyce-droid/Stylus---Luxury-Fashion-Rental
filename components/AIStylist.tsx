import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, Loader2 } from 'lucide-react';
import { ChatMessage } from '../types';
import { getStylingAdvice } from '../services/geminiService';
import { Button } from './Button';

export const AIStylist: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      text: 'Welcome to Stylus Concierge. I am your personal AI stylist. Are you looking for something for a specific occasion, or perhaps a signature piece to elevate your wardrobe?',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await getStylingAdvice(userMsg.text);
      const modelMsg: ChatMessage = {
        role: 'model',
        text: responseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, modelMsg]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[600px] w-full max-w-4xl mx-auto bg-white/5 backdrop-blur-sm border border-golden-orange/30 rounded-lg overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="bg-espresso/80 border-b border-golden-orange/20 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-golden-orange rounded-full">
            <Sparkles size={20} className="text-espresso" />
          </div>
          <div>
            <h3 className="font-serif text-lg text-golden-orange tracking-wide">Stylus Concierge</h3>
            <p className="text-xs text-cream/60">Powered by Gemini 2.5</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] rounded-lg p-4 ${
              msg.role === 'user' 
                ? 'bg-golden-orange text-espresso font-medium' 
                : 'bg-white/10 text-cream border border-white/5'
            }`}>
              <div className="flex items-start gap-3">
                {msg.role === 'model' && <Sparkles size={16} className="mt-1 flex-shrink-0 text-golden-light" />}
                {msg.role === 'user' && <User size={16} className="mt-1 flex-shrink-0 opacity-50" />}
                <p className="leading-relaxed text-sm">{msg.text}</p>
              </div>
              <span className={`text-[10px] block mt-2 opacity-50 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/10 text-cream border border-white/5 rounded-lg p-4 flex items-center space-x-2">
              <Loader2 className="animate-spin text-golden-orange" size={16} />
              <span className="text-sm text-cream/70 italic">Consulting fashion archives...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-espresso/50 p-4 border-t border-white/10">
        <div className="flex items-center space-x-4">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask for styling advice (e.g., 'I have a winter gala in Paris...')"
            className="flex-1 bg-white/5 border border-white/10 text-cream placeholder-cream/30 px-4 py-3 rounded focus:outline-none focus:border-golden-orange transition-colors"
          />
          <Button onClick={handleSend} disabled={isLoading || !input.trim()} variant="primary">
            <Send size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
};