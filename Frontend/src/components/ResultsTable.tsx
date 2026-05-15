import React from 'react';
import type { SQLQueryResult } from '../api/types';

// Tabla dinámica, scroll horizontal y manejo estado vacío
export const ResultsTable: React.FC<{ result?: SQLQueryResult }> = ({ result }) => {
  if (!result)
    return <div className="italic text-gray-400">No hay resultados aún</div>;
  if (result.error)
    return <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-2">{result.error}</div>;
  if (!result.rows?.length)
    return <div className="italic text-gray-400">La consulta no devolvió filas</div>;
  return (
    <div className="overflow-x-auto w-full">
      <table className="min-w-[400px] border dark:border-neutral-700 border-collapse my-2">
        <thead className="bg-gray-200 dark:bg-neutral-800">
          <tr>
            {result.columns.map((col) => (
              <th key={col} className="px-3 py-2 border dark:border-neutral-700 font-semibold">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {result.rows.map((row, i) => (
            <tr key={i} className="even:bg-gray-100 odd:bg-white dark:even:bg-neutral-800 dark:odd:bg-neutral-900">
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-2 border dark:border-neutral-700 ">{String(cell ?? '')}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="text-xs text-gray-600 mb-2 mt-0">{result.rows.length} filas mostradas{typeof result.rowcount === 'number' ? ` (total: ${result.rowcount})` : ''}</div>
    </div>
  );
};
export default ResultsTable;
