import type React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  return (
    <div className={`inline-flex items-center gap-1 select-none ${className}`} aria-label="Hey Buss">
      <span
        style={{ color: '#0B1330' }}
        className={`font-black italic tracking-tight ${size === 'lg' ? 'text-4xl' : size === 'sm' ? 'text-xl' : 'text-2xl sm:text-3xl'}`}
      >
        Hey
      </span>
      <span
        style={{
          backgroundColor: '#FFB800',
          color: '#0B1330',
        }}
        className={`px-2.5 py-0.5 rounded-md font-black border-2 border-black/10 tracking-wide shadow-sm ${size === 'lg' ? 'text-3xl' : size === 'sm' ? 'text-lg' : 'text-xl sm:text-2xl'}`}
      >
        Buss
      </span>
    </div>
  );
};
