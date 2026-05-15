import React from 'react';
import Layout from '../components/Layout';
import HealthStatus from '../components/HealthStatus';
import DatasetUploader from '../components/DatasetUploader';
import DatasetSchemaViewer from '../components/DatasetSchemaViewer';
import NaturalLanguageQueryPanel from '../components/NaturalLanguageQueryPanel';
import SqlQueryPanel from '../components/SqlQueryPanel';

import type { DatasetFromDbResponse } from '../api/types';

const LOCAL_KEY = '__last_dataset';

import ChatPanel from '../components/chat/ChatPanel';

export const HomePage: React.FC = () => {
  const [dataset, setDataset] = React.useState<DatasetFromDbResponse | null>(null);

  // Opcional: persistir último dataset_id
  React.useEffect(() => {
    const saved = window.localStorage.getItem(LOCAL_KEY);
    if (saved) {
      try {
        setDataset(JSON.parse(saved));
      } catch { /* ignore */ }
    }
  }, []);

  React.useEffect(() => {
    if (dataset) window.localStorage.setItem(LOCAL_KEY, JSON.stringify(dataset));
  }, [dataset]);
  console.log('HomePage render', dataset );
  return (
    <Layout>
      <div className="flex items-center justify-between mb-4 gap-4">
        <span className="text-xl font-semibold">SQLite NL-to-SQL Assistant</span>
        <HealthStatus />
      </div>
      <section className="my-6 w-full max-w-2xl mx-auto">
        <DatasetUploader onLoaded={setDataset} />
        {dataset?.id && (
          <div className="mt-3 p-2 bg-purple-50 dark:bg-neutral-800 rounded">
            <div className="text-sm font-medium text-slate-800 dark:text-gray-300 mb-2">
              Dataset cargado: <span className="font-mono px-1 bg-white dark:bg-neutral-900 border rounded">{dataset.id}</span>
              {dataset.source_filename && (<span> | Nombre: <b>{dataset.source_filename}</b></span>)}
            </div>
            <DatasetSchemaViewer tables={dataset.tables} />
          </div>
        )}
      </section>
      {dataset?.id && (
        <>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 min-w-0">
              <NaturalLanguageQueryPanel datasetId={dataset.id} />
              <SqlQueryPanel datasetId={dataset.id} />
            </div>
            <div className="flex-1 min-w-0 max-w-2xl">
              <div className="mt-4 md:mt-0">
                <ChatPanel datasetId={dataset.id} />
              </div>
            </div>
          </div>
        </>
      )}
      {!dataset?.id && (
        <div className="my-6 text-gray-400">Sube un dataset para empezar a consultar.</div>
      )}
    </Layout>
  );
};
export default HomePage;
