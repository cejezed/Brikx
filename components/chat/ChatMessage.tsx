'use client';

import React from 'react';

type Msg = {
  role: 'user' | 'assistant';
  text: string;
  id?: string;
};

export default function ChatMessage({ msg }: { msg: Msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={['flex flex-col', isUser ? 'items-end' : 'items-start'].join(' ')}>
      <div
        className={[
          'max-w-[85%] lg:max-w-[75%] px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap shadow-sm transition-all duration-200',
          isUser
            ? 'bg-slate-800 text-white rounded-[1.5rem] rounded-tr-md shadow-lg dark:bg-white dark:text-slate-900 dark:shadow-white/10'
            : 'bg-white/80 text-slate-800 rounded-[1.5rem] rounded-tl-md border border-white/50 backdrop-blur-xl shadow-md dark:bg-slate-900/60 dark:text-slate-100 dark:border-white/10 dark:shadow-[0_10px_30px_-15px_rgba(0,0,0,0.6)]',
        ].join(' ')}
      >
        {msg.text}
      </div>
    </div>
  );
}
