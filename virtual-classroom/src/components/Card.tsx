import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  shadow?: 'subtle' | 'medium' | 'large';
  radius?: 'sm' | 'md' | 'lg' | 'xl';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  shadow = 'medium',
  radius = 'md',
  padding = 'md',
  className = '',
  children,
  ...props
}) => {
  const baseStyles = 'bg-surface';
  
  const shadowStyles = {
    subtle: 'shadow-subtle',
    medium: 'shadow-medium',
    large: 'shadow-large',
  };
  
  const radiusStyles = {
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
  };
  
  const paddingStyles = {
    none: '',
    sm: 'p-16',
    md: 'p-24',
    lg: 'p-32',
  };

  return (
    <div
      className={`${baseStyles} ${shadowStyles[shadow]} ${radiusStyles[radius]} ${paddingStyles[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
