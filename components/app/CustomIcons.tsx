import React from 'react';

export const FoodBowlIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Kibbles stacked */}
    <circle cx="12" cy="9.5" r="1.2" />
    <circle cx="9.5" cy="10" r="1.2" />
    <circle cx="14.5" cy="10" r="1.2" />
    <circle cx="7.5" cy="11.5" r="1.2" />
    <circle cx="12" cy="11.5" r="1.2" />
    <circle cx="16.5" cy="11.5" r="1.2" />
    <circle cx="10" cy="12.5" r="1.2" />
    <circle cx="14" cy="12.5" r="1.2" />
    {/* Bowl ellipse opening */}
    <ellipse cx="12" cy="13" rx="8" ry="2" />
    {/* Bowl sides and bottom */}
    <path d="M4 13l-1.5 6a2 2 0 0 0 2 2h15a2 2 0 0 0 2-2l-1.5-6" />
    <path d="M4.5 19c2 1 5 1.5 7.5 1.5s5.5-.5 7.5-1.5" />
  </svg>
);

export const BoneIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M17 10c.7-.7 1.69-1 2.75-1a3.25 3.25 0 1 1 0 6.5C18.69 15.5 17.7 15.2 17 14.5L7 21.5c-.7.7-1.69 1-2.75 1a3.25 3.25 0 1 1 0-6.5C5.31 16 6.3 16.3 7 17l10-7z" />
  </svg>
);

export const TeddyBearIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Ears */}
    <circle cx="7.5" cy="7.5" r="2.5" />
    <circle cx="16.5" cy="7.5" r="2.5" />
    {/* Head */}
    <circle cx="12" cy="10" r="5.5" />
    {/* Snout */}
    <ellipse cx="12" cy="12" rx="2.5" ry="2" />
    {/* Eyes & Nose */}
    <circle cx="9.5" cy="9.5" r="0.5" fill="currentColor" />
    <circle cx="14.5" cy="9.5" r="0.5" fill="currentColor" />
    <circle cx="12" cy="11.5" r="0.5" fill="currentColor" />
    <path d="M11 13c.3.3.7.5 1 .5s.7-.2 1-.5" />
    {/* Body */}
    <ellipse cx="12" cy="18" rx="5" ry="5.5" />
    {/* Arms */}
    <circle cx="6.5" cy="16" r="2.5" />
    <circle cx="17.5" cy="16" r="2.5" />
    {/* Legs */}
    <circle cx="8" cy="21.5" r="2.5" />
    <circle cx="16" cy="21.5" r="2.5" />
  </svg>
);

export const CollarIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Collar Base */}
    <ellipse cx="12" cy="10" rx="9" ry="3" />
    <path d="M3 10v3.5c0 1.7 4 3.5 9 3.5s9-1.8 9-3.5V10" />
    {/* Buckle line and holes */}
    <path d="M8 10v6" />
    <circle cx="15.5" cy="13.5" r="0.3" fill="currentColor" />
    <circle cx="18" cy="12.5" r="0.3" fill="currentColor" />
    {/* Hanging ring and heart */}
    <path d="M12 17v1.5" />
    <path d="M12 18.5c-1.5-1.5-3-1.5-3 0 0 1.5 3 4.5 3 4.5s3-3 3-4.5c0-1.5-1.5-1.5-3 0z" />
  </svg>
);

export const ScissorsBubblesIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Scissors Blades */}
    <path d="M7 21L18 3" />
    <path d="M17 21L6 3" />
    {/* Handles */}
    <circle cx="6" cy="20" r="3" />
    <circle cx="18" cy="20" r="3" />
    <circle cx="12" cy="12" r="0.8" fill="currentColor" />
    {/* Bubbles */}
    <circle cx="19.5" cy="13.5" r="1.2" />
    <circle cx="21.5" cy="9.5" r="1.5" />
    <circle cx="19.5" cy="5.5" r="1" />
  </svg>
);
