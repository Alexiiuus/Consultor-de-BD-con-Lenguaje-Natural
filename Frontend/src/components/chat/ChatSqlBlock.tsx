import React from 'react';

const ChatSqlBlock: React.FC<{ sql?: string }> = ({ sql }) => {
  const handleCopy = () => {
    if (!sql) return;
    navigator.clipboard.writeText(sql);
  };
  if (!sql) return null;
  return (
    <div className="my-1">
      <div className="flex items-center gap-1 mb-1">
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">SQL generada</span>
        <button className="text-xs text-blue-500 underline ml-2" onClick={handleCopy}>Copiar SQL</button>
      </div>
      <pre className="bg-neutral-900 text-green-300 p-2 rounded whitespace-pre-wrap overflow-x-auto text-xs"><code>{sql}</code></pre>
    </div>
  );
};
export default ChatSqlBlock;
