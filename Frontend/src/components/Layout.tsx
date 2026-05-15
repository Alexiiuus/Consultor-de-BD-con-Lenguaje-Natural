import React from 'react';

export const Layout: React.FC<{children: React.ReactNode}> = ({ children }) => (
  <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-neutral-900">
    <header className="border-b p-4 text-center">
      <h1 className="text-3xl font-bold">SQLite NL-to-SQL Assistant</h1>
    </header>
    <main className="flex-1 flex flex-col items-center p-4 ">{children}</main>
  </div>
);
export default Layout;
