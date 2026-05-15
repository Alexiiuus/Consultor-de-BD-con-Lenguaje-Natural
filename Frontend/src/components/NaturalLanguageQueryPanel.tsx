import React, { useState } from 'react';
import { nlQuery } from '../api/datasets';
import type { NLQueryResponse } from '../api/types';
import GeneratedSqlViewer from './GeneratedSqlViewer';
import ResultsTable from './ResultsTable';
import LoadingState from './LoadingState';
import ErrorMessage from './ErrorMessage';

function rowsDictToArray(rows: Record<string, any>[], columns: string[]): any[][] {
  return rows.map(row => columns.map(col => row[col]));
}

const exampleQuestions = [
  '¿Cuántos registros hay por categoría?',
  'Mostrame las ventas totales por mes',
  'Listá los 10 clientes con más compras'
];

export const NaturalLanguageQueryPanel: React.FC<{
  datasetId: string;
}> = ({ datasetId }) => {
  const [question, setQuestion] = useState('');
  const [execute, setExecute] = useState(true);
  const [response, setResponse] = useState<NLQueryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const resp = await nlQuery(datasetId, { question, execute });
      setResponse(resp);
    } catch (err:any) {
      setError(err.message || 'Error al consultar');
      setResponse(null);
    } finally {
      setLoading(false);
    }
  };
  return (
    <section className="my-6 w-full max-w-2xl mx-auto">
      <h2 className="font-semibold mb-2">Pregunta en lenguaje natural</h2>
      <form onSubmit={handleAsk} className="flex flex-col gap-2">
        <textarea
          className="w-full rounded border px-2 py-1" rows={2}
          placeholder={exampleQuestions[Math.floor(Math.random() * exampleQuestions.length)]}
          value={question}
          onChange={e => setQuestion(e.target.value)}
          required
        />
        <label className="inline-flex items-center text-sm">
          <input type="checkbox" checked={execute} onChange={v=>setExecute(v.target.checked)} className="mr-2 scale-110" /> Ejecutar la consulta generada automáticamente
        </label>
        <button type="submit" className="bg-accent text-white font-semibold px-4 py-2 mt-2 rounded shadow hover:bg-purple-700 active:bg-purple-800" disabled={loading}>
          Consultar
        </button>
      </form>
      {loading && <LoadingState text='Consultando backend...' />}
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {response && (
        <>
          <div className="mt-2 mb-1">
            <label className="block font-medium mb-1 text-sm">Pregunta enviada:</label>
            <pre className="bg-gray-50 dark:bg-neutral-800 px-3 py-1 rounded whitespace-pre-wrap text-sm">{question}</pre>
          </div>
          <GeneratedSqlViewer sql={response.sql_query} explanation={response.question} />
          {execute && response.executed && (
            <ResultsTable result={{
              columns: response.columns,
              rows: rowsDictToArray(response.rows, response.columns),
              row_count: response.row_count,
            }} />
          )}
        </>
      )}
    </section>
  );
};
export default NaturalLanguageQueryPanel;
