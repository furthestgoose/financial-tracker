import React from 'react';

// Input Component
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
}

const Input: React.FC<InputProps> = ({ label, id, ...props }) => {
  return (
    <div className="form-group">
      <label htmlFor={id} className="block font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        id={id}
        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
        {...props}
      />
    </div>
  );
};

// Label Component
interface LabelProps {
  htmlFor: string;
  children: React.ReactNode;
}

const Label: React.FC<LabelProps> = ({ htmlFor, children }) => {
  return (
    <label htmlFor={htmlFor} className="block font-medium text-gray-700 mb-1">
      {children}
    </label>
  );
};

// Checkbox Component
interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
}

const Checkbox: React.FC<CheckboxProps> = ({ id, label, ...props }) => {
  return (
    <div className="flex items-center">
      <input
        type="checkbox"
        id={id}
        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        {...props}
      />
      <label htmlFor={id} className="ml-2 block text-gray-700">
        {label}
      </label>
    </div>
  );
};

// Select Component
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  id: string;
  children: React.ReactNode;
}

const Select: React.FC<SelectProps> = ({ label, id, children, ...props }) => {
  return (
    <div className="form-group">
      <label htmlFor={id} className="block font-medium text-gray-700 mb-1">
        {label}
      </label>
      <select
        id={id}
        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
        {...props}
      >
        {children}
      </select>
    </div>
  );
};

export { Input, Label, Checkbox, Select };
