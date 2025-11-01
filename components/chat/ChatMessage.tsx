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
    <div className={['flex', isUser ? 'justify-end' : 'justify-start'].join(' ')}>
      <div
        className={[
          'max-w-[80%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap',
          isUser ? 'bg-[#0d3d4d] text-white' : 'bg-gray-100 text-gray-900',
        ].join(' ')}
      >
        {msg.text}
      </div>
    </div>
  );
}