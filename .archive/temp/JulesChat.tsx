import React, { useRef, useEffect, useState } from 'react';
import { Send, Sparkles, Bot, Mic } from 'lucide-react';
import { ChatMessage } from '../types';

interface JulesChatProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  theme: 'light' | 'dark';
}

export const JulesChat: React.FC<JulesChatProps> = ({ messages, onSendMessage, theme }) => {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isDark = theme === 'dark';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.sender === 'user') {
        setIsTyping(true);
        const timer = setTimeout(() => setIsTyping(false), 1500);
        return () => clearTimeout(timer);
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSendMessage(input);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full relative overflow-hidden bg-transparent">
      
      {/* Enhanced Header */}
      <div className={`px-8 py-8 flex items-center gap-5 z-10 transition-colors ${isDark ? 'bg-gradient-to-b from-slate-900/80 to-transparent' : 'bg-gradient-to-b from-white/80 to-transparent'}`}>
        <div className="relative group cursor-pointer">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brikx-500 to-emerald-400 flex items-center justify-center text-white shadow-xl shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-500">
                <Bot size={28} />
            </div>
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center border-2 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-white'}`}>
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            </div>
        </div>
        <div>
            <h2 className={`font-black text-xl tracking-tight leading-none mb-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>Jules</h2>
            <div className="flex items-center gap-2">
                <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-brikx-400' : 'text-brikx-600'}`}>AI Architect</span>
                <span className={`w-1 h-1 rounded-full ${isDark ? 'bg-slate-600' : 'bg-slate-400'}`}></span>
                <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Online</span>
            </div>
        </div>
      </div>

      {/* Messages Area - Added padding bottom for floating input */}
      <div className="flex-1 overflow-y-auto px-6 lg:px-8 pt-2 pb-32 space-y-8 custom-scrollbar relative z-10 scroll-smooth">
        <div className="text-center py-4">
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase backdrop-blur-md ${isDark ? 'bg-white/5 text-slate-400' : 'bg-slate-900/5 text-slate-500'}`}>
                Vandaag
            </span>
        </div>
        
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
            <div
              className={`max-w-[90%] px-6 py-4 text-[15px] leading-relaxed transition-all shadow-md ${
                msg.sender === 'user'
                  ? (isDark 
                      ? 'bg-white text-slate-900 rounded-[1.5rem] rounded-tr-none font-medium' 
                      : 'bg-slate-800 text-white rounded-[1.5rem] rounded-tr-none font-medium shadow-xl shadow-slate-900/10') 
                  : (isDark 
                      ? 'bg-white/10 text-slate-100 rounded-[1.5rem] rounded-tl-none border border-white/10 backdrop-blur-md' 
                      : 'bg-white/80 text-slate-800 rounded-[1.5rem] rounded-tl-none border border-white/50 backdrop-blur-xl shadow-sm')
              }`}
            >
              {msg.text}
            </div>
            <span className={`text-[10px] mt-2 px-2 opacity-50 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </span>
          </div>
        ))}

        {isTyping && (
             <div className="flex flex-col items-start animate-in fade-in">
                <div className={`px-6 py-5 rounded-[1.5rem] rounded-tl-none flex items-center gap-1.5 w-20 backdrop-blur-md ${isDark ? 'bg-white/10' : 'bg-white/70 border border-white/40'}`}>
                    <div className={`w-2 h-2 rounded-full animate-bounce [animation-delay:-0.3s] ${isDark ? 'bg-brikx-300' : 'bg-slate-500'}`}></div>
                    <div className={`w-2 h-2 rounded-full animate-bounce [animation-delay:-0.15s] ${isDark ? 'bg-brikx-300' : 'bg-slate-500'}`}></div>
                    <div className={`w-2 h-2 rounded-full animate-bounce ${isDark ? 'bg-brikx-300' : 'bg-slate-500'}`}></div>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* "Floating" Input Command Center */}
      <div className={`absolute bottom-0 inset-x-0 p-6 lg:p-8 z-20 ${isDark ? 'bg-gradient-to-t from-[#0F172A] via-[#0F172A]/80 to-transparent' : 'bg-gradient-to-t from-slate-200 via-slate-200/80 to-transparent'}`}>
        <form onSubmit={handleSubmit} className="relative group max-w-2xl mx-auto w-full">
          {/* Glowing Aura in Dark Mode */}
          {isDark && <div className="absolute -inset-1 bg-gradient-to-r from-brikx-500/20 via-indigo-500/20 to-brikx-500/20 rounded-[2rem] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-700"></div>}
          
          <div className={`relative flex items-center p-2 rounded-[2rem] border transition-all duration-300 shadow-2xl ${
              isDark 
              ? 'bg-slate-900/90 border-white/10 group-focus-within:border-white/20 group-focus-within:bg-slate-800' 
              : 'bg-white border-white/50 shadow-slate-300/50 group-focus-within:scale-[1.01]'
          }`}>
              <button type="button" className={`p-3 rounded-full transition-colors ${isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-400'}`}>
                <Mic size={20} />
              </button>
              
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Vertel Jules wat je wilt bouwen..."
                className={`flex-1 bg-transparent border-none px-2 py-3 text-base focus:ring-0 focus:outline-none placeholder:font-medium ${
                    isDark 
                    ? 'text-white placeholder-slate-500' 
                    : 'text-slate-800 placeholder-slate-400'
                }`}
              />
              
              <button
                type="submit"
                disabled={!input.trim()}
                className={`p-3 rounded-xl transition-all duration-300 transform active:scale-95 flex items-center gap-2 ${
                    input.trim() 
                    ? 'bg-brikx-500 text-white shadow-lg shadow-brikx-500/30 w-auto px-4' 
                    : `w-10 ${isDark ? 'bg-white/5 text-slate-500' : 'bg-slate-100 text-slate-400'}`
                }`}
              >
                {input.trim() ? (
                    <>
                        <span className="text-sm font-bold">Verstuur</span>
                        <Send size={16} />
                    </>
                ) : (
                    <Sparkles size={18} />
                )}
              </button>
          </div>
          
          <div className="text-center mt-3">
              <p className={`text-[10px] font-medium opacity-50 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Jules denkt mee met je ontwerp & budget.
              </p>
          </div>
        </form>
      </div>
    </div>
  );
};