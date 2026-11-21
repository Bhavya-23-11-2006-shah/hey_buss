import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', fullWidth, loading, leftIcon, rightIcon, children, className = '', disabled, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center gap-2 font-bold rounded-btn transition-all duration-150 select-none cursor-pointer focus-visible:outline-none';

    const variants = {
      primary:   'btn-primary',
      secondary: 'btn-secondary',
      ghost:     'btn-ghost',
      danger:    'btn-danger',
    };

    const sizes = {
      sm: 'px-4 text-sm',
      md: 'px-5',
      lg: 'px-6 text-lead',
    };

    // Size overrides min-height for sm
    const minH = size === 'sm' ? 'min-h-[2.5rem]' : size === 'lg' ? 'min-h-[3.5rem]' : 'min-h-[3rem]';

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${base} ${variants[variant]} ${sizes[size]} ${minH} ${fullWidth ? 'w-full' : ''} ${className}`}
        {...props}
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" aria-hidden />
        ) : leftIcon}
        {children}
        {!loading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
