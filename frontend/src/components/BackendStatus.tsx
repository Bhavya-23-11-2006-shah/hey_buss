import React, { useEffect, useState } from 'react';
import { checkBackendHealth, IS_REAL_BACKEND } from '../api/client';

type BackendStatusValue = 'checking' | 'live' | 'mock';

export const BackendStatus: React.FC = () => {
  const [status, setStatus] = useState<BackendStatusValue>(
    IS_REAL_BACKEND ? 'checking' : 'mock'
  );

  useEffect(() => {
    let active = true;

    const refreshStatus = async () => {
      if (!IS_REAL_BACKEND) {
        setStatus('mock');
        return;
      }

      const healthy = await checkBackendHealth();
      if (active) setStatus(healthy ? 'live' : 'mock');
    };

    void refreshStatus();
    const interval = window.setInterval(() => void refreshStatus(), 30_000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  const label = status === 'checking'
    ? 'Checking backend…'
    : status === 'live'
      ? 'Live backend'
      : 'Mock mode';
  const color = status === 'live' ? 'bg-green-700' : status === 'mock' ? 'bg-amber-700' : 'bg-neutral-500';
  const detail = status === 'live'
    ? 'The configured backend health check succeeded.'
    : status === 'mock'
      ? IS_REAL_BACKEND
        ? 'The configured backend did not respond successfully; API requests use mock data when they fail.'
        : 'VITE_API_URL is not set; API requests use mock data.'
      : 'Checking the configured backend health endpoint.';

  return (
    <div className="flex justify-center border-t border-neutral-200 px-2 pb-2 pt-1">
      <span
        role="status"
        aria-live="polite"
        title={detail}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-700"
      >
        <span aria-hidden="true" className={`h-2 w-2 rounded-full ${color}`} />
        {label}
      </span>
    </div>
  );
};
