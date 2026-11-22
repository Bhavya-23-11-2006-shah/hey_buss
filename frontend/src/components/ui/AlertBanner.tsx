import React from 'react';
import { AlertIcon, CheckIcon, XIcon } from '../Icons';

type Variant = 'info' | 'success' | 'warning' | 'danger';

interface AlertBannerProps {
  variant?: Variant;
  title?: string;
  children: React.ReactNode;
  onDismiss?: () => void;
  className?: string;
}

const styles: Record<Variant, { bg: string; border: string; text: string; Icon: React.FC<any> }> = {
  info:    { bg: '#EBF0FD', border: 'var(--color-cobalt)',   text: 'var(--color-cobalt)',  Icon: AlertIcon },
  success: { bg: '#E6F7F1', border: 'var(--color-success)',  text: 'var(--color-success)', Icon: CheckIcon },
  warning: { bg: '#FFF0E6', border: 'var(--color-warning)',  text: 'var(--color-warning)', Icon: AlertIcon },
  danger:  { bg: '#FCE8EB', border: 'var(--color-danger)',   text: 'var(--color-danger)',  Icon: AlertIcon },
};

export const AlertBanner: React.FC<AlertBannerProps> = ({
  variant = 'info', title, children, onDismiss, className = '',
}) => {
  const s = styles[variant];
  const { Icon } = s;
  return (
    <div
      role="alert"
      className={`flex gap-3 p-4 rounded-card border ${className}`}
      style={{ background: s.bg, borderColor: s.border }}
    >
      <Icon size={20} style={{ color: s.text, flexShrink: 0, marginTop: '2px' }} />
      <div className="flex-1 min-w-0">
        {title && <p className="font-bold" style={{ color: s.text }}>{title}</p>}
        <div className="text-ink text-sm">{children}</div>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          className="flex-shrink-0 p-1 rounded-btn hover:bg-black/10 transition-colors"
        >
          <XIcon size={16} style={{ color: s.text }} />
        </button>
      )}
    </div>
  );
};
