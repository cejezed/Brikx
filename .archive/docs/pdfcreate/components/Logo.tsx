import React from 'react';

export const Logo: React.FC<{ className?: string; variant?: 'default' | 'white' }> = ({ className = "h-8", variant = 'default' }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    {/* Abstract representation of the Brikx logo based on image */}
    <div className="relative w-8 h-8">
        <div className={`absolute top-0 right-0 w-5 h-5 rounded-tr-lg rounded-bl-lg ${variant === 'white' ? 'bg-white/90' : 'bg-brikx-200'}`}></div>
        <div className={`absolute bottom-0 left-0 w-5 h-5 rounded-tr-lg rounded-bl-lg mix-blend-multiply opacity-90 ${variant === 'white' ? 'bg-brikx-300' : 'bg-brikx-600'}`}></div>
    </div>
    <span className={`font-bold text-xl tracking-tight ${variant === 'white' ? 'text-white' : 'text-slate-800'}`}>Brikx</span>
  </div>
);