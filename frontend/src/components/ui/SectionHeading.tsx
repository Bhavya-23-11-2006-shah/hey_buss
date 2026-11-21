import React from 'react';

interface SectionHeadingProps {
  as?: 'h1' | 'h2' | 'h3' | 'h4';
  children: React.ReactNode;
  sub?: string;
  className?: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  as: Tag = 'h2', children, sub, className = '',
}) => (
  <div className={className}>
    <Tag
      className="font-bold text-ink"
      style={{ fontSize: Tag === 'h1' ? 'var(--text-h1-m)' : Tag === 'h2' ? 'var(--text-h2)' : 'var(--text-h3)' }}
    >
      {children}
    </Tag>
    {sub && <p className="mt-1 text-muted" style={{ fontSize: 'var(--text-sm)' }}>{sub}</p>}
  </div>
);
