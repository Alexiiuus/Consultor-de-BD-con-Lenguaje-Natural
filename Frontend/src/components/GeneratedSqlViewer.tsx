import React from 'react';
export const GeneratedSqlViewer: React.FC<{ sql: string, explanation?: string }> = ({ sql, explanation }) => (
  <div className="mb-4">
    <label className="block font-semibold mb-1">SQL generada:</label>
    <pre className="bg-neutral-900 text-green-300 p-3 rounded whitespace-pre-wrap overflow-x-auto text-sm mb-2"><code>{sql}</code></pre>
    {explanation && <div className="text-sm text-gray-600 bg-gray-50 dark:bg-neutral-700 px-2 py-1 rounded">💡 {explanation}</div>}
  </div>
);
export default GeneratedSqlViewer;
