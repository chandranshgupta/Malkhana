import React from 'react';

export const Stamp = ({ text, type = 'blue', rotate = '-rotate-12', extraClasses = '' }) => {
  const isRed = type === 'red';
  const colorClass = isRed ? 'text-red-700 border-red-700' : 'text-slate-600 border-slate-600';
  const fillClass = isRed ? 'fill-red-700' : 'fill-slate-600';

  return (
    <div className={`absolute w-32 h-32 pointer-events-none opacity-80 ${rotate} z-10 ${extraClasses}`}>
      <svg viewBox="0 0 100 100" className={`w-full h-full ${type === 'red' ? 'animate-[pulse_4s_ease-in-out_infinite]' : ''}`}>
        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" className={colorClass} strokeWidth="2" strokeDasharray="4 2" />
        <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" className={colorClass} strokeWidth="1" />
        <path id={`textPath-${text.replace(/\s+/g, '-')}`} d="M 15 50 A 35 35 0 1 1 85 50 A 35 35 0 1 1 15 50" fill="none" />
        <text className={`${fillClass} text-[9px] font-bold tracking-wider`} letterSpacing="2">
          <textPath href={`#textPath-${text.replace(/\s+/g, '-')}`} startOffset="50%" textAnchor="middle">
            • FORENSIC CONTROL • FORENSIC CONTROL 
          </textPath>
        </text>
        <rect x="15" y="40" width="70" height="20" className={`fill-[#f0f4f8] border-y-2 ${colorClass}`} />
        <text x="50" y="53" textAnchor="middle" className={`${fillClass} text-[8px] font-black tracking-widest`}>
          {text}
        </text>
      </svg>
    </div>
  );
};
