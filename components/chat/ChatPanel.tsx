'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useChatStore } from '@/lib/stores/useChatStore';
import { useWizardState } from '@/lib/stores/useWizardState';

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
      <div className="flex flex-col border rounded-2xl overflow-hidden bg-white" style={{ height: '100%', maxHeight: '100%' }}>
        {/* Header */}
        <div className="flex-shrink-0 px-4 py-3 border-b bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-gray-900">
                  Hoi! Ik ben Jules
                </h3>
                <p className="text-xs text-gray-600">Uw digitale bouwcoach</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleSend('Hoe werkt deze wizard?')}
                className="px-3 py-1.5 text-xs rounded-full bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Help</span>
              </button>
              <button
                type="button"
                onClick={() => setShowHandoff(true)}
                className="px-3 py-1.5 text-xs rounded-full border border-slate-300 hover:bg-slate-100"
              >
                Menselijke architect
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div
          ref={messagesContainerRef}
          style={{ flex: 1, minHeight: 0, overflow: 'auto' }}
          className="px-4 py-3 space-y-2 text-sm"
        >
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
            <TypingIndicator name="Jules" className="mt-2" />
          )}

          {error && (
            <div className="rounded-md bg-red-50 p-3 text-xs text-red-700">
              <strong>Fout:</strong> {error}
            </div>
          )}
        </div>

        {/* Input */}
        <div className="flex-shrink-0 border-t px-3 py-2 bg-white">
          <ChatInput
            value={input}
            onChange={setInput}
            onSend={handleSend}
            onAbort={isStreaming ? handleAbort : undefined}
            disabled={isStreaming}
          />
          <p className="mt-1 text-[10px] text-slate-400">
            Antwoorden kunnen direct je hoofdstukken invullen of je naar de juiste stap sturen.
          </p>
        </div>
      </div>

      <HumanHandoffModal
        isOpen={showHandoff}
        onClose={() => setShowHandoff(false)}
      />
    </>
  );
}
