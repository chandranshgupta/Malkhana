import React from 'react';

export const WireframeSSD = () => (
  <svg viewBox="0 0 200 120" className="w-full h-full text-slate-600" fill="none" stroke="currentColor" strokeWidth="1.5">
    <polygon points="40,80 160,20 190,40 70,100" fill="rgba(100,116,139,0.05)" />
    <polygon points="40,80 40,90 70,110 70,100" />
    <polygon points="70,110 190,50 190,40 70,100" />
    <polygon points="50,75 150,25 180,45 80,95" strokeWidth="0.5" />
    <polygon points="60,70 80,60 90,65 70,75" fill="currentColor" fillOpacity="0.1" />
    <polygon points="90,55 110,45 120,50 100,60" fill="currentColor" fillOpacity="0.1" />
    <polygon points="120,40 140,30 150,35 130,45" fill="currentColor" fillOpacity="0.1" />
    <polygon points="80,80 100,70 110,75 90,85" fill="currentColor" fillOpacity="0.1" />
    <polygon points="110,65 130,55 140,60 120,70" fill="currentColor" fillOpacity="0.1" />
    <polygon points="140,50 160,40 170,45 150,55" fill="currentColor" fillOpacity="0.1" />
    <line x1="45" y1="85" x2="65" y2="105" strokeWidth="0.5" strokeDasharray="1 2"/>
  </svg>
);

export const WireframePhone = () => (
  <svg viewBox="0 0 200 120" className="w-full h-full text-slate-600" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M50,70 L150,20 Q160,15 165,25 L180,50 Q185,60 175,65 L75,115 Q65,120 60,110 L45,85 Q40,75 50,70 Z" fill="rgba(100,116,139,0.05)" />
    <path d="M50,70 L150,20 Q160,15 165,25 L180,50 Q185,60 175,65 L75,115 Q65,120 60,110 L45,85 Q40,75 50,70 Z" />
    <path d="M55,70 L145,25 L170,50 L80,110 Z" strokeWidth="0.5" />
    <polyline points="120,40 100,60 110,75 80,90" strokeWidth="1" />
    <polyline points="100,60 85,55" strokeWidth="0.5" />
    <polyline points="110,75 135,70" strokeWidth="0.5" />
    <line x1="47" y1="77" x2="44" y2="83" />
    <line x1="167" y1="23" x2="164" y2="29" />
  </svg>
);

export const WireframeDVR = () => (
  <svg viewBox="0 0 200 120" className="w-full h-full text-slate-600" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="20" y="50" width="160" height="40" fill="rgba(100,116,139,0.05)" />
    <rect x="20" y="50" width="160" height="40" />
    <polygon points="20,50 40,30 180,30 180,50" />
    <line x1="40" y1="30" x2="180" y2="30" />
    <rect x="10" y="55" width="10" height="30" />
    <circle cx="15" cy="62" r="1.5" />
    <circle cx="15" cy="78" r="1.5" />
    <rect x="180" y="55" width="10" height="30" />
    <circle cx="185" cy="62" r="1.5" />
    <circle cx="185" cy="78" r="1.5" />
    <rect x="110" y="65" width="60" height="15" strokeWidth="0.5" />
    <circle cx="120" cy="72.5" r="3" />
    <circle cx="135" cy="72.5" r="3" />
    <circle cx="150" cy="72.5" r="3" />
    <circle cx="165" cy="72.5" r="3" />
    <line x1="30" y1="65" x2="80" y2="65" strokeWidth="0.5" />
    <line x1="30" y1="70" x2="80" y2="70" strokeWidth="0.5" />
    <line x1="30" y1="75" x2="80" y2="75" strokeWidth="0.5" />
  </svg>
);

export const WireframePerson = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full text-slate-600" fill="none" stroke="currentColor" strokeWidth="0.75" strokeLinejoin="round">
    <polygon points="50,15 65,30 60,45 40,45 35,30" fill="rgba(100,116,139,0.05)" />
    <polygon points="50,15 65,30 50,40" />
    <polygon points="50,15 35,30 50,40" />
    <polygon points="35,30 50,40 40,45" />
    <polygon points="65,30 50,40 60,45" />
    <polygon points="40,45 50,40 60,45" fill="rgba(100,116,139,0.1)" />
    <polygon points="40,45 60,45 55,55 45,55" />
    <line x1="50" y1="45" x2="50" y2="55" />
    <polygon points="45,55 55,55 80,75 80,95 20,95 20,75" fill="rgba(100,116,139,0.05)" />
    <polygon points="45,55 50,75 20,75" />
    <polygon points="55,55 50,75 80,75" />
    <polygon points="50,75 20,95 50,95" />
    <polygon points="50,75 80,95 50,95" />
    <polygon points="20,75 20,95 50,75" />
    <polygon points="80,75 80,95 50,75" />
    <line x1="50" y1="55" x2="50" y2="75" />
    <circle cx="50" cy="40" r="1" fill="currentColor" />
    <circle cx="35" cy="30" r="1" fill="currentColor" />
    <circle cx="65" cy="30" r="1" fill="currentColor" />
    <circle cx="20" cy="75" r="1" fill="currentColor" />
    <circle cx="80" cy="75" r="1" fill="currentColor" />
  </svg>
);
