'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useChatStore } from '@/lib/stores/useChatStore';
import { useWizardState } from '@/lib/stores/useWizardState';

import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import HumanHandoffModal from './HumanHandoffModal';

type MsgRole = 'user' | 'assistant';

export default function ChatPanel() {
  const mode = useWizardState((s) => s.mode);

  const messages = useChatStore((s) => s.messages);
  const isStreaming = useChatStore((s) => s.isStreaming);
  const error = useChatStore((s) => s.error);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const abortController = useChatStore((s) => s.abortController);
  const appendSystemMessage = useChatStore((s) => s.appendSystemMessage);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Scroll naar beneden bij nieuwe berichten (alleen binnen chat container)
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

  useEffect(() => {
    if (messages.length === 0) {
      appendSystemMessage(
        'Hoi! Ik ben Jules, je digitale bouwcoach.\n\n' +
          'Ik help je stap voor stap naar een professioneel Programma van Eisen (PvE).\n' +
          'Vertel in je eigen woorden je budget, ruimtes, wensen en zorgen; ik vul de wizard met je mee en stuur je naar de juiste stap.'
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [input, setInput] = useState('');
  const [showHandoff, setShowHandoff] = useState(false);

  const handleSend = useCallback(() => {
    const q = input.trim();
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
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b bg-slate-50">
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-500">
              Brikx Assistent
            </div>
            <div className="text-sm text-slate-700">
              {mode === 'PREMIUM'
                ? '⭐ Premium-mode actief'
                : 'Preview-mode (basis antwoorden)'}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowHandoff(true)}
            className="px-3 py-1.5 text-xs rounded-full border border-slate-300 hover:bg-slate-100"
          >
            Menselijke architect
          </button>
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
            <div className="text-xs text-slate-400 mt-1">
              Jules is aan het typen…
            </div>
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
