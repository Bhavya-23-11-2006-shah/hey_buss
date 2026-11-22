import React from 'react';

interface SkeletonProps {
  className?: string;
  lines?: number;
  height?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', lines = 1, height = 'h-5' }) => {
  if (lines === 1) {
    return (
      <div
        className={`shimmer rounded-btn ${height} ${className}`}
        aria-hidden="true"
      />
    );
  }
  return (
    <div className={`space-y-2 ${className}`} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`shimmer rounded-btn ${height} ${i === lines - 1 ? 'w-3/4' : 'w-full'}`}
        />
      ))}
    </div>
  );
};

export const CardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`card p-5 space-y-3 ${className}`} aria-hidden="true">
    <div className="flex items-center justify-between">
      <Skeleton className="w-24" />
      <Skeleton className="w-12 h-6" />
    </div>
    <Skeleton lines={2} height="h-4" />
    <Skeleton className="w-32 h-10" />
  </div>
);
