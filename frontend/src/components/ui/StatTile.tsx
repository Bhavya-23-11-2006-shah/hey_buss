import React from 'react';

interface StatTileProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  className?: string;
}

export const StatTile: React.FC<StatTileProps> = ({
  label,
  value,
  subtext,
  icon,
  className = '',
}) => {
  return (
    <div className={`card p-4 flex flex-col justify-between ${className}`}>
      <div className="flex items-center justify-between text-muted text-xs font-bold uppercase tracking-wider mb-2">
        <span>{label}</span>
        {icon && <span className="text-cobalt">{icon}</span>}
      </div>
      <div className="text-2xl font-black text-ink tabular mb-1">
        {value}
      </div>
      {subtext && (
        <div className="text-xs text-muted">
          {subtext}
        </div>
      )}
    </div>
  );
};
