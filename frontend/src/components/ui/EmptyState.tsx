import React from 'react';
import { Button } from './Button';
import { RefreshIcon } from '../Icons';

interface EmptyStateProps {
  icon?: React.ReactNode;
  heading: string;
  body?: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, heading, body, action, className = '' }) => (
  <div className={`card p-8 text-center space-y-4 ${className}`} role="status">
    {icon && (
      <div className="flex justify-center">
        <span className="text-muted">{icon}</span>
      </div>
    )}
    <div>
      <p className="font-bold text-h3 text-ink" style={{ fontSize: 'var(--text-h3)' }}>{heading}</p>
      {body && <p className="mt-1 text-muted">{body}</p>}
    </div>
    {action && (
      <Button variant="secondary" onClick={action.onClick} leftIcon={<RefreshIcon size={16} />}>
        {action.label}
      </Button>
    )}
  </div>
);
