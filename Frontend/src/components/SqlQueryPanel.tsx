import React, { useState } from 'react';
import { sqlQuery } from '../api/datasets';
import ResultsTable from './ResultsTable';
import LoadingState from './LoadingState';
import ErrorMessage from './ErrorMessage';

export const SqlQueryPanel: React.FC<{ datasetId: string }> = ({ datasetId }) => {
  const [sql, setSql] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExec = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sql.trim().toLowerCase().startsWith('select')) {
      setError('Solo se permiten consultas readonly (SELECT)');
      setResponse(null);
      return;
    }
    setLoading(true); setError(null);
    try {
      const res = await sqlQuery(datasetId, { sql });
      setResponse(res);
    } catch (err:any) {
      setError(err.message || 'Error ejecutando SQL');
      setResponse(null);
    } finally {
      setLoading(false);
    }
  };
  return (
    <section className="my-6 w-full max-w-2xl mx-auto border-t pt-5">
      <h2 className="font-semibold mb-2">Ejecutar SQL manual (solo consultas readonly)</h2>
      <form onSubmit={handleExec} className="flex flex-col gap-2">
        <textarea
          className="w-full rounded border px-2 py-1 font-mono text-sm"
          rows={2}
          placeholder="SELECT * FROM tabla LIMIT 10"
          value={sql}
          onChange={e => setSql(e.target.value)}
          required
        />
        <button type="submit" className="bg-slate-800 text-white font-semibold px-4 py-2 rounded shadow hover:bg-slate-900 mt-1 w-48" disabled={loading}>
          Ejecutar SQL
        </button>
      </form>
      {loading && <LoadingState text='Consultando...' />}
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {response && <ResultsTable result={response} />}
    </section>
  );
};
export default SqlQueryPanel;
