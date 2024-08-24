import React, { ButtonHTMLAttributes, ReactNode } from 'react';

// Define a type for the Button props
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void; // Update type to include event parameter
  children: ReactNode;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ onClick, children, className, ...props }) => {
  return (
    <button
      onClick={onClick}
      className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export { Button };
