import React from 'react';
import type { TripStatus } from '../../types';
import { CheckIcon, AlertIcon, ClockIcon, RampIcon } from '../Icons';

interface StatusPillProps {
  status: TripStatus | 'RAMP' | 'CONFIRMED' | 'AT_STOP' | 'BUS_HERE' | 'ASSISTING' | 'REASSIGNED' | 'CANCELLED';
  delayMin?: number;
  className?: string;
}

const CONFIG: Record<string, { label: string; cls: string; Icon: React.FC<any> }> = {
  ON_TIME:    { label: 'On time',    cls: 'text-success border-success',    Icon: CheckIcon  },
  DELAYED:    { label: 'Delayed',    cls: 'text-warning border-warning',    Icon: AlertIcon  },
  FULL:       { label: 'Full',       cls: 'text-danger border-danger',      Icon: AlertIcon  },
  CANCELLED:  { label: 'Cancelled',  cls: 'text-danger border-danger',      Icon: AlertIcon  },
  RAMP:       { label: 'Ramp',       cls: 'text-cobalt border-cobalt',      Icon: RampIcon   },
  CONFIRMED:  { label: 'Confirmed',  cls: 'text-success border-success',    Icon: CheckIcon  },
  AT_STOP:    { label: 'At stop',    cls: 'text-cobalt border-cobalt',      Icon: ClockIcon  },
  BUS_HERE:   { label: 'Bus here',   cls: 'text-success border-success',    Icon: CheckIcon  },
  ASSISTING:  { label: 'Assisting',  cls: 'text-success border-success',    Icon: CheckIcon  },
  REASSIGNED: { label: 'Reassigned', cls: 'text-warning border-warning',    Icon: AlertIcon  },
};

export const StatusPill: React.FC<StatusPillProps> = ({ status, delayMin, className = '' }) => {
  const cfg = CONFIG[status] ?? { label: status, cls: 'text-muted border-muted', Icon: ClockIcon };
  const { Icon } = cfg;
  const label = status === 'DELAYED' && delayMin ? `Delayed ${delayMin} min` : cfg.label;
  return (
    <span className={`status-pill ${cfg.cls} ${className}`} aria-label={label}>
      <Icon size={12} />
      <span>{label}</span>
    </span>
  );
};
