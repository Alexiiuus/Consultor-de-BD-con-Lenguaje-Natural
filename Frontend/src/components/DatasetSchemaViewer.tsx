import React from 'react';
import type { DatasetSchema } from '../api/types';

export const DatasetSchemaViewer: React.FC<{ tables?: Array<DatasetSchema> }> = ({ tables }) => {
  if (!tables) return <div className="italic text-gray-400">No hay esquema disponible</div>;
  return (
    <div className="mb-4">
      <h2 className="text-lg font-semibold mb-2">Esquema del Dataset:</h2>
      {tables.map((table) => (
        <div key={table.name} className="mb-2">
          <div className="font-bold">Tabla: {table.name}</div>
          <ul className="ml-4 list-disc">
            {table.columns.map((col) => (
              <li key={col.name}>{col.name} <span className="text-xs text-gray-500">({col.type})</span></li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};
export default DatasetSchemaViewer;
