import React from 'react';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'accent';
  active?: boolean;
  ariaLabel: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  size = 'md',
  variant = 'primary',
  active = false,
  ariaLabel,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-full transition-all duration-200 ease-in-out active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantStyles = {
    primary: active 
      ? 'bg-accent text-background' 
      : 'bg-primary text-surface hover:bg-secondary',
    secondary: active
      ? 'bg-accent text-background'
      : 'bg-transparent text-background border-2 border-background hover:bg-secondary hover:text-surface hover:border-secondary',
    accent: active
      ? 'bg-accent-light text-background'
      : 'bg-accent text-background hover:bg-accent-light',
  };
  
  const sizeStyles = {
    sm: 'w-32 h-32 p-8',
    md: 'w-40 h-40 p-8',
    lg: 'w-48 h-48 p-12',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled}
      aria-label={ariaLabel}
      {...props}
    >
      {icon}
    </button>
  );
};
