import React from 'react';

const Input = ({ label, id, ...props }) => {
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

const Label = ({ htmlFor, children }) => {
  return (
    <label htmlFor={htmlFor} className="block font-medium text-gray-700 mb-1">
      {children}
    </label>
  );
};

const Checkbox = ({ id, label, ...props }) => {
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

export { Input, Label, Checkbox };
