// 2px-stroke SVG line icons only. All icons accept size + className + style props.
import type React from 'react';

export interface IconProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  'aria-hidden'?: boolean;
}

export const MicIcon = ({ size = 20, className = '', style, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden={p['aria-hidden'] ?? true}>
    <rect x="9" y="2" width="6" height="13" rx="3"/>
    <path d="M5 10a7 7 0 0014 0"/>
    <line x1="12" y1="20" x2="12" y2="23"/>
    <line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
);

export const BusIcon = ({ size = 20, className = '', style, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden={p['aria-hidden'] ?? true}>
    <rect x="2" y="6" width="20" height="13" rx="2"/>
    <path d="M2 12h20"/>
    <path d="M7 6V3M17 6V3"/>
    <circle cx="6.5" cy="21" r="1.5"/><circle cx="17.5" cy="21" r="1.5"/>
    <path d="M6.5 19.5V19M17.5 19.5V19"/>
  </svg>
);

export const LocationIcon = ({ size = 20, className = '', style, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden={p['aria-hidden'] ?? true}>
    <path d="M12 2C8.68 2 6 4.68 6 8c0 4.5 6 13 6 13s6-8.5 6-13c0-3.32-2.68-6-6-6z"/>
    <circle cx="12" cy="8" r="2"/>
  </svg>
);

export const CheckIcon = ({ size = 20, className = '', style, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden={p['aria-hidden'] ?? true}>
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

export const AlertIcon = ({ size = 20, className = '', style, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden={p['aria-hidden'] ?? true}>
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

export const BlindIcon = ({ size = 20, className = '', style, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden={p['aria-hidden'] ?? true}>
    <line x1="2" y1="2" x2="22" y2="22"/>
    <path d="M6.71 6.71A10.9 10.9 0 002 12s3.63 7 10 7a10.7 10.7 0 005.17-1.3"/>
    <path d="M10.44 10.44A3 3 0 0113.56 13.56"/>
    <path d="M22 12s-1.4-2.6-3.57-4.57"/>
    <line x1="12" y1="2" x2="12" y2="2"/>
  </svg>
);

export const DeafIcon = ({ size = 20, className = '', style, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden={p['aria-hidden'] ?? true}>
    <path d="M3 3l18 18"/>
    <path d="M18.4 18.4A9 9 0 006.6 6.6"/>
    <path d="M12 3a9 9 0 019 9"/>
    <path d="M12 7a5 5 0 015 5"/>
  </svg>
);

export const WheelchairIcon = ({ size = 20, className = '', style, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden={p['aria-hidden'] ?? true}>
    <circle cx="12" cy="4" r="1.5"/>
    <path d="M9 10h4l2 5h3"/>
    <path d="M9 10l-1.5 5H10"/>
    <circle cx="8" cy="20" r="2"/><circle cx="17" cy="20" r="2"/>
    <path d="M10 20h5"/>
  </svg>
);

export const ClockIcon = ({ size = 20, className = '', style, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden={p['aria-hidden'] ?? true}>
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

export const RampIcon = ({ size = 20, className = '', style, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden={p['aria-hidden'] ?? true}>
    <path d="M4 20L20 4"/><path d="M4 20h16"/><path d="M20 4v16"/>
  </svg>
);

export const ChevronRightIcon = ({ size = 20, className = '', style, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden={p['aria-hidden'] ?? true}>
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

export const ChevronLeftIcon = ({ size = 20, className = '', style, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden={p['aria-hidden'] ?? true}>
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);

export const HomeIcon = ({ size = 20, className = '', style, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden={p['aria-hidden'] ?? true}>
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

export const BookIcon = ({ size = 20, className = '', style, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden={p['aria-hidden'] ?? true}>
    <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
  </svg>
);

export const MapIcon = ({ size = 20, className = '', style, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden={p['aria-hidden'] ?? true}>
    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
    <line x1="8" y1="2" x2="8" y2="18"/>
    <line x1="16" y1="6" x2="16" y2="22"/>
  </svg>
);

export const TicketIcon = ({ size = 20, className = '', style, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden={p['aria-hidden'] ?? true}>
    <path d="M2 9a3 3 0 010 6v2a2 2 0 002 2h16a2 2 0 002-2v-2a3 3 0 010-6V7a2 2 0 00-2-2H4a2 2 0 00-2 2v2z"/>
    <line x1="12" y1="7" x2="12" y2="17" strokeDasharray="2 2"/>
  </svg>
);

export const HelpIcon = ({ size = 20, className = '', style, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden={p['aria-hidden'] ?? true}>
    <circle cx="12" cy="12" r="10"/>
    <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

export const UserIcon = ({ size = 20, className = '', style, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden={p['aria-hidden'] ?? true}>
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

export const SettingsIcon = ({ size = 20, className = '', style, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden={p['aria-hidden'] ?? true}>
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
  </svg>
);

export const XIcon = ({ size = 20, className = '', style, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden={p['aria-hidden'] ?? true}>
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

export const VolumeIcon = ({ size = 20, className = '', style, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden={p['aria-hidden'] ?? true}>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
    <path d="M15.54 8.46a5 5 0 010 7.07"/>
    <path d="M19.07 4.93a10 10 0 010 14.14"/>
  </svg>
);

export const RefreshIcon = ({ size = 20, className = '', style, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden={p['aria-hidden'] ?? true}>
    <polyline points="23 4 23 10 17 10"/>
    <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
  </svg>
);

export const ShareIcon = ({ size = 20, className = '', style, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden={p['aria-hidden'] ?? true}>
    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </svg>
);

export const UndoIcon = ({ size = 20, className = '', style, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden={p['aria-hidden'] ?? true}>
    <polyline points="9 14 4 9 9 4"/>
    <path d="M20 20v-7a4 4 0 00-4-4H4"/>
  </svg>
);

export const ArrowRightIcon = ({ size = 20, className = '', style, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden={p['aria-hidden'] ?? true}>
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
);

export const SunIcon = ({ size = 20, className = '', style, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden={p['aria-hidden'] ?? true}>
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

export const MoonIcon = ({ size = 20, className = '', style, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden={p['aria-hidden'] ?? true}>
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
  </svg>
);

export const ContrastIcon = ({ size = 20, className = '', style, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden={p['aria-hidden'] ?? true}>
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 2v20M2 12h20" strokeOpacity="0.3"/>
    <path d="M12 2a10 10 0 010 20z" fill="currentColor" stroke="none"/>
  </svg>
);

export const QRIcon = ({ size = 20, className = '', style, ...p }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden={p['aria-hidden'] ?? true}>
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/>
    <rect x="5" y="5" width="3" height="3" fill="currentColor" stroke="none"/>
    <rect x="16" y="5" width="3" height="3" fill="currentColor" stroke="none"/>
    <rect x="5" y="16" width="3" height="3" fill="currentColor" stroke="none"/>
    <line x1="14" y1="14" x2="14" y2="14"/><line x1="17" y1="14" x2="17" y2="14"/>
    <line x1="20" y1="14" x2="20" y2="14"/><line x1="20" y1="17" x2="20" y2="17"/>
    <line x1="17" y1="17" x2="17" y2="17"/><line x1="14" y1="20" x2="14" y2="20"/>
    <line x1="17" y1="20" x2="17" y2="20"/><line x1="20" y1="20" x2="20" y2="20"/>
  </svg>
);
