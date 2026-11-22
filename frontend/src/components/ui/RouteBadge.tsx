import React from 'react';

interface RouteBadgeProps {
  route: string;
  className?: string;
}

export const RouteBadge: React.FC<RouteBadgeProps> = ({ route, className = '' }) => (
  <span
    className={`inline-block px-2.5 py-0.5 rounded font-bold tabular route-num ${className}`}
    style={{
      background: 'var(--color-marigold)',
      color: '#0B1330',
      fontSize: '0.778rem',
      letterSpacing: '0.04em',
    }}
    aria-label={`Route ${route}`}
  >
    {route}
  </span>
);
