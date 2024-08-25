import React, { HTMLProps, ReactNode } from 'react';

interface CardProps extends HTMLProps<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

// Card component
export const Card: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div
      className={`bg-white shadow-md rounded-md overflow-hidden ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// CardHeader component
export const CardHeader: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div
      className={`bg-gray-100 px-4 py-3 border-b ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// CardContent component
export const CardContent: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div className={`p-4 ${className}`} {...props}>
      {children}
    </div>
  );
};
