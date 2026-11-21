import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
  'aria-hidden'?: boolean | 'true' | 'false';
}

export const BusIcon: React.FC<IconProps> = ({ className = "w-6 h-6", size, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={size ? { width: size, height: size } : undefined}
    aria-hidden="true"
    {...props}
  >
    <rect x="3" y="3" width="18" height="15" rx="2" />
    <path d="M3 9h18" />
    <path d="M7 14h.01" />
    <path d="M17 14h.01" />
    <path d="M5 18v3" />
    <path d="M19 18v3" />
    <path d="M9 5h6" />
  </svg>
);

export const MicIcon: React.FC<IconProps> = ({ className = "w-6 h-6", size, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={size ? { width: size, height: size } : undefined}
    aria-hidden="true"
    {...props}
  >
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="22" />
    <line x1="8" y1="22" x2="16" y2="22" />
  </svg>
);

export const WheelchairIcon: React.FC<IconProps> = ({ className = "w-6 h-6", size, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={size ? { width: size, height: size } : undefined}
    aria-hidden="true"
    {...props}
  >
    <circle cx="9" cy="4" r="2" />
    <path d="M5 9h5v6H6" />
    <path d="M10 13a5 5 0 1 0 5 5" />
    <path d="M14 9h5l2 8" />
  </svg>
);

export const DeafIcon: React.FC<IconProps> = ({ className = "w-6 h-6", size, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={size ? { width: size, height: size } : undefined}
    aria-hidden="true"
    {...props}
  >
    <path d="M6 8.5a6.5 6.5 0 1 1 13 0c0 4-2.5 6-4 7.5L12 19" />
    <path d="M10 10.5c.5-1.5 2-1.5 2.5 0 1 2-1 3.5-1.5 4" />
    <line x1="3" y1="3" x2="21" y2="21" />
  </svg>
);

export const BlindIcon: React.FC<IconProps> = ({ className = "w-6 h-6", size, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={size ? { width: size, height: size } : undefined}
    aria-hidden="true"
    {...props}
  >
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
    <line x1="12" y1="12" x2="19" y2="19" />
  </svg>
);

export const CheckIcon: React.FC<IconProps> = ({ className = "w-6 h-6", size, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={size ? { width: size, height: size } : undefined}
    aria-hidden="true"
    {...props}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const LocationIcon: React.FC<IconProps> = ({ className = "w-6 h-6", size, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={size ? { width: size, height: size } : undefined}
    aria-hidden="true"
    {...props}
  >
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

export const ClockIcon: React.FC<IconProps> = ({ className = "w-6 h-6", size, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={size ? { width: size, height: size } : undefined}
    aria-hidden="true"
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

export const RampIcon: React.FC<IconProps> = ({ className = "w-6 h-6", size, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={size ? { width: size, height: size } : undefined}
    aria-hidden="true"
    {...props}
  >
    <path d="M3 19h18" />
    <path d="M4 19l14-8v8" />
    <path d="M18 11h3" />
  </svg>
);

export const AlertIcon: React.FC<IconProps> = ({ className = "w-6 h-6", size, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={size ? { width: size, height: size } : undefined}
    aria-hidden="true"
    {...props}
  >
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

export const SpeakerIcon: React.FC<IconProps> = ({ className = "w-6 h-6", size, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={size ? { width: size, height: size } : undefined}
    aria-hidden="true"
    {...props}
  >
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
  </svg>
);
