import { useState } from 'react';
import { nlQuery } from '../api/datasets';
import type { ChatMessage } from '../types/chat';

function genId() {
  return Math.random().toString(36).slice(2) + '-' + Date.now();
}

function rowsDictToArray(rows: Record<string, any>[], columns: string[]): any[][] {
  return rows.map(row => columns.map(col => row[col]));
}

export function useDatasetChat(datasetId: string | undefined | null) {
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [pending, setPending] = useState(false);

  // Agregar mensaje user y assistant "pending"
  async function ask(question: string) {
    if (!datasetId || pending) return;
    const userMsg: ChatMessage = {
      id: genId(),
      role: 'user',
      content: question,
      createdAt: new Date().toISOString(),
      status: 'success'
    };
    setHistory(h => [...h, userMsg]);
    const assistantMsg: ChatMessage = {
      id: genId(),
      role: 'assistant',
      content: '',
      createdAt: new Date().toISOString(),
      status: 'pending',
    };
    setHistory(h => [...h, assistantMsg]);
    setPending(true);
    try {
      const resp = await nlQuery(datasetId, { question, execute: true });
      setHistory(hh => hh.map(m =>
        m.id === assistantMsg.id
          ? {
              ...m,
              status: 'success',
              sql: resp.sql_query,
              columns: resp.columns,
              rows: rowsDictToArray(resp.rows, resp.columns),
              content: resp.question || 'Consulta ejecutada.',
            }
          : m
      ));
    } catch (error: any) {
      setHistory(hh => hh.map(m =>
        m.id === assistantMsg.id
          ? {
              ...m,
              status: 'error',
              content: error.message || 'Error al consultar',
              error: error.message || 'Error al consultar',
            }
          : m
      ));
    } finally {
      setPending(false);
    }
  }

  function retry(messageIdx:number) {
    const msg = history.filter(m=>m.role==='user')[messageIdx];
    if (msg) {
      ask(msg.content);
    }
  }

  function clear() {
    setHistory([]);
  }

  return {
    history,
    pending,
    ask,
    retry,
    clear,
    setHistory,
  };
}
