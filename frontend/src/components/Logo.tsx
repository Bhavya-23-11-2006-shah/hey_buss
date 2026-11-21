import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const heights = {
    sm: 36,
    md: 46,
    lg: 60,
  };

  const h = heights[size];
  const w = Math.round(h * 3.1);

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <svg
        viewBox="0 0 160 50"
        width={w}
        height={h}
        role="img"
        aria-label="Hey Buss"
        className="overflow-visible"
      >
        {/* "Hey" in editorial serif */}
        <text
          x="4"
          y="35"
          fontFamily="'Fraunces', Georgia, serif"
          fontSize="36"
          fontWeight="800"
          fontStyle="italic"
          fill="#121212"
          letterSpacing="-0.5"
        >
          Hey
        </text>

        {/* Signal-yellow route-number badge */}
        <g transform="translate(74, 5)">
          <rect
            x="0"
            y="0"
            width="82"
            height="40"
            rx="6"
            fill="#FFDE00"
            stroke="#121212"
            strokeWidth="3"
            filter="drop-shadow(2px 2px 0px #121212)"
          />
          {/* "Buss" in bold Atkinson Hyperlegible */}
          <text
            x="41"
            y="29"
            fontFamily="'Atkinson Hyperlegible', system-ui, sans-serif"
            fontSize="25"
            fontWeight="900"
            fill="#121212"
            textAnchor="middle"
            letterSpacing="0.8"
          >
            Buss
          </text>
        </g>
      </svg>
    </div>
  );
};
