import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  fullWidth = false,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  const baseStyles = 'px-16 py-12 text-base font-normal bg-surface border rounded-md transition-all duration-200 ease-in-out';
  const focusStyles = 'focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary';
  const errorStyles = error ? 'border-red-500' : 'border-gray-300';
  const widthStyles = fullWidth ? 'w-full' : '';

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-background mb-8"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`${baseStyles} ${focusStyles} ${errorStyles} ${widthStyles} ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-8 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};
