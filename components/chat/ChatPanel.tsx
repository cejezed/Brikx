'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useChatStore } from '@/lib/stores/useChatStore';
import { useWizardState } from '@/lib/stores/useWizardState';
import { Bot } from 'lucide-react';

import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import HumanHandoffModal from './HumanHandoffModal';
import TypingIndicator from '@/components/common/TypingIndicator';

type MsgRole = 'user' | 'assistant';

export default function ChatPanel() {
  const mode = useWizardState((s) => s.mode);

  const messages = useChatStore((s) => s.messages);
  const isStreaming = useChatStore((s) => s.isStreaming);
  const error = useChatStore((s) => s.error);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const abortController = useChatStore((s) => s.abortController);

  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Scroll naar beneden bij nieuwe berichten (alleen binnen chat container)
  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming, scrollToBottom]);

  // Extra scroll na render om zeker te zijn
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100);
    return () => clearTimeout(timer);
  }, [messages, scrollToBottom]);

  const [input, setInput] = useState('');
  const [showHandoff, setShowHandoff] = useState(false);

  const handleSend = useCallback((messageText?: string) => {
    const q = (messageText || input).trim();
    if (!q || isStreaming) return;
    sendMessage(q, mode);
    setInput('');
  }, [input, isStreaming, sendMessage, mode]);

  const handleAbort = useCallback(() => {
    if (abortController) {
      abortController.abort();
    }
  }, [abortController]);

  return (
    <>
      <div className="flex flex-col h-full relative overflow-hidden glass-light-strong rounded-2xl glass-shadow-lg">

        {/* Enhanced Header - JulesChat Style */}
        <div className="px-6 py-6 flex items-center gap-4 bg-gradient-to-b from-white/80 to-transparent border-b border-white/50">
          <div className="relative group cursor-pointer">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brikx-500 to-emerald-400 flex items-center justify-center text-white shadow-xl shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-500">
              <Bot size={24} />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center border-2 bg-white border-white">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-black text-lg tracking-tight leading-none mb-1 text-slate-800 truncate">
              Jules
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-brikx-600">AI Architect</span>
              <span className="w-1 h-1 rounded-full bg-slate-400"></span>
              <span className="text-xs text-slate-500">Online</span>
            </div>
          </div>
        </div>

        {/* Messages Area - With custom scrollbar */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto px-4 lg:px-6 pt-2 pb-4 space-y-6 custom-scrollbar relative scroll-smooth"
        >
          {/* Today label */}
          <div className="text-center py-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase backdrop-blur-md bg-slate-900/5 text-slate-500">
              Vandaag
            </span>
          </div>

          {messages
            .filter((m) => m.role !== 'system')
            .map((m) => (
              <ChatMessage
                key={m.id}
                msg={{
                  id: m.id,
                  role: m.role as MsgRole,
                  text: m.content,
                }}
              />
            ))}

          {isStreaming && (
            <div className="flex flex-col items-start animate-in fade-in">
              <TypingIndicator name="Jules" className="mt-2" />
            </div>
          )}

          {error && (
            <div className="rounded-2xl bg-red-50 border border-red-100 p-3 text-xs text-red-700">
              <strong>Fout:</strong> {error}
            </div>
          )}
        </div>

        {/* Input Area - Jules Style (within container, not floating absolute) */}
        <div className="flex-shrink-0 p-4 lg:p-6 bg-gradient-to-t from-slate-100 via-slate-50/80 to-transparent">
          <ChatInput
            value={input}
            onChange={setInput}
            onSend={handleSend}
            onAbort={isStreaming ? handleAbort : undefined}
            disabled={isStreaming}
          />
          <div className="text-center mt-2">
            <p className="text-[10px] font-medium text-slate-500">
              Jules denkt mee met je ontwerp & budget.
            </p>
          </div>
        </div>
      </div>

      <HumanHandoffModal
        isOpen={showHandoff}
        onClose={() => setShowHandoff(false)}
      />
    </>
  );
}
