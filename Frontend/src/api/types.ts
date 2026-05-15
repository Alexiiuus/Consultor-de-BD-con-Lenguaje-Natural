// Tipos TypeScript para la API NL-to-SQL

// Salud del backend
export interface HealthResponse {
  status: string; // "ok" u otro
  [key: string]: any;
}

// Respuesta tras subir un dataset desde archivo
export interface DatasetFromDbResponse {
  id: string;
  source_filename: string;
  tables: Array<DatasetSchema>;
}

// Esquema de una base de datos
export interface DatasetSchema {
  name: string;
  columns: Array<{
    name: string;
    type: string;
    not_null?: boolean;
    pk?: boolean;
    [key: string]: any;
  }>;
}

// Solicitud de consulta en lenguaje natural
export interface NLQueryRequest {
  question: string;
  execute?: boolean;
}

export interface NLQueryResponse {
  question: string;
  sql_query: string;
  executed: boolean;
  columns: string[];
  rows: Record<string, any>[];
  row_count: number;
}

// Consulta SQL manual
export interface SQLQueryRequest {
  sql: string;
}

export interface SQLQueryResult {
  columns: string[];
  rows: any[][];
  rowcount?: number;
  error?: string;
}
