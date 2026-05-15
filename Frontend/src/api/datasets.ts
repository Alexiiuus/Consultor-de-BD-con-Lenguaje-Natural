import { apiFetch } from './client';
import type {
  HealthResponse,
  DatasetFromDbResponse,
  NLQueryRequest,
  NLQueryResponse,
  SQLQueryRequest,
  SQLQueryResult,
} from './types';

// Comprobar salud del backend
export function getHealth(): Promise<HealthResponse> {
  return apiFetch<HealthResponse>(`/api/v1/health`);
}

// Subir SQLite y registrar dataset
export async function uploadDataset(file: File): Promise<DatasetFromDbResponse> {
  const formData = new FormData();
  formData.append('file', file);
  return apiFetch<DatasetFromDbResponse>(`/api/v1/datasets/from-db`, {
    method: 'POST',
    body: formData,
  });
}

// Consultar en NL
export async function nlQuery(
  datasetId: string,
  body: NLQueryRequest
): Promise<NLQueryResponse> {
  return apiFetch<NLQueryResponse>(`/api/v1/datasets/${datasetId}/nl-query`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

// Consultar SQL manual
export async function sqlQuery(
  datasetId: string,
  body: SQLQueryRequest
): Promise<SQLQueryResult> {
  return apiFetch<SQLQueryResult>(`/api/v1/datasets/${datasetId}/query`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}
