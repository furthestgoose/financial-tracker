import React from 'react';

export const Card = ({ children, className, ...props }) => {
  return (
    <div
      className={`bg-white shadow-md rounded-md overflow-hidden ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className, ...props }) => {
  return (
    <div
      className={`bg-gray-100 px-4 py-3 border-b ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardContent = ({ children, className, ...props }) => {
  return (
    <div className={`p-4 ${className}`} {...props}>
      {children}
    </div>
  );
};