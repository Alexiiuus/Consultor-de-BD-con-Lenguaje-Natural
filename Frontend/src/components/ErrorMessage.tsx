import React from 'react';
export const ErrorMessage: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">{children}</div>
);
export default ErrorMessage;
