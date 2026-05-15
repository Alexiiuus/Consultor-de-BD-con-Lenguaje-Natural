import React from 'react';
import { useDatasetChat } from '../../hooks/useDatasetChat';
import type { ChatMessage } from '../../types/chat';
import ChatHistory from './ChatHistory';
import ChatInput from './ChatInput';

const examplePrompts = [
  '¿Cuántos registros hay en total?',
  'Mostrame los 10 registros más recientes',
  'Agrupá los resultados por categoría',
  '¿Cuál es el promedio por mes?'
];

export const ChatPanel: React.FC<{ datasetId?: string | null }> = ({ datasetId }) => {
  const {
    history, ask, pending, clear, retry
  } = useDatasetChat(datasetId);

  const empty = !history.length;
  console.log('ChatPanel render', { datasetId, history, pending });
  return (
    <div className="flex flex-col h-[450px] max-h-[60vh] rounded border bg-white dark:bg-neutral-900 shadow-md p-2 w-full max-w-2xl mx-auto">
      <header className="flex items-center gap-2 pb-2 border-b mb-2">
        <h2 className="font-semibold text-lg flex-1">Asistente conversacional</h2>
        <button onClick={clear} className="text-sm text-red-500 hover:underline px-2">Limpiar chat</button>
      </header>
      <div className="flex-1 overflow-y-auto">
        {!datasetId && (
            <div className="text-gray-500 p-4 text-center">Cargá un dataset para comenzar el chat.</div>
        )}
        {datasetId && empty && (
          <div className="text-gray-400 text-center mt-8">
            <div className="mb-2">¿Sobre qué datos querés consultar?</div>
            <div className="space-y-1">
              {examplePrompts.map(example => (
                <button key={example} disabled={pending}
                  className="bg-slate-100 dark:bg-neutral-800 px-3 py-1 m-1 rounded text-xs hover:bg-accent/30"
                  onClick={() => ask(example)}
                >{example}</button>
              ))}
            </div>
          </div>
        )}
        {datasetId && <ChatHistory history={history} retry={retry} />}
      </div>
      <footer className="pt-2 mt-2 border-t">
        <ChatInput disabled={!datasetId || pending} onSend={ask} />
      </footer>
    </div>
  );
};

export default ChatPanel;
