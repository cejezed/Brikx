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
            ? 'bg-slate-800 text-white rounded-[1.5rem] rounded-tr-md shadow-lg'
            : 'bg-white/80 text-slate-800 rounded-[1.5rem] rounded-tl-md border border-white/50 backdrop-blur-xl shadow-md',
        ].join(' ')}
      >
        {msg.text}
      </div>
    </div>
  );
}