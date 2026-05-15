import React from 'react';
import ResultsTable from '../ResultsTable';

const ChatResultPreview: React.FC<{ columns?: string[]; rows?: any[][] }> = ({ columns, rows }) => {
  if (!rows || !columns)
    return null;
  if (!rows.length)
    return <div className="italic text-gray-400">No se encontraron resultados</div>;
  // ResultsTable espera un objeto tipo SQLQueryResult
  return <ResultsTable result={{ columns, rows }} />;
};
export default ChatResultPreview;
