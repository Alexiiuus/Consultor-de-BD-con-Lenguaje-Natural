import React from 'react';
import { uploadDataset } from '../api/datasets';
import type { DatasetFromDbResponse } from '../api/types';
import LoadingState from './LoadingState';
import ErrorMessage from './ErrorMessage';

export const DatasetUploader: React.FC<{
  onLoaded: (info: DatasetFromDbResponse) => void;
}> = ({ onLoaded }) => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const resp = await uploadDataset(file);
      onLoaded(resp);
    } catch (err:any) {
      setError(err.message || 'Error subiendo archivo');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="my-4">
      <label className="block mb-2 font-medium">Sube un archivo SQLite (.db)</label>
      <input type="file" accept=".db,.sqlite" onChange={handleChange} className="mb-2" />
      {loading && <LoadingState text="Subiendo archivo..." />}
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </div>
  );
};
export default DatasetUploader;
