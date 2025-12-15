'use client';

import React from 'react';

type Msg = {
  role: 'user' | 'assistant' | 'architect';
  text: string;
  id?: string;
};

export default function ChatMessage({ msg }: { msg: Msg }) {
  const isUser = msg.role === 'user';
  const isArchitect = msg.role === 'architect';
  return (
    <div className={['flex flex-col', isUser ? 'items-end' : 'items-start'].join(' ')}>
      <div
        className={[
          'max-w-[85%] lg:max-w-[75%] px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap shadow-sm transition-all duration-200',
          isUser
            ? 'bg-slate-800 text-white rounded-[1.5rem] rounded-tr-md shadow-lg dark:bg-white dark:text-slate-900 dark:shadow-white/10'
            : isArchitect
            ? 'bg-emerald-50 text-emerald-900 rounded-[1.5rem] rounded-tl-md border border-emerald-100 shadow-md dark:bg-emerald-900/40 dark:text-emerald-50 dark:border-emerald-700/60'
            : 'bg-white/80 text-slate-800 rounded-[1.5rem] rounded-tl-md border border-white/50 backdrop-blur-xl shadow-md dark:bg-slate-900/60 dark:text-slate-100 dark:border-white/10 dark:shadow-[0_10px_30px_-15px_rgba(0,0,0,0.6)]',
        ].join(' ')}
      >
        {isArchitect && (
          <span className="block text-[10px] font-bold uppercase tracking-[0.2em] mb-1 text-emerald-700 dark:text-emerald-200">
            Architect Insight
          </span>
        )}
        {msg.text}
      </div>
    </div>
  );
}
