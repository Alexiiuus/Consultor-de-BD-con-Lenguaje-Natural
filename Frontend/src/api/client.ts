// Central HTTP client using Fetch API and env var

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export async function apiFetch<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${url}`, {
    headers: {
      'Accept': 'application/json',
    },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    const detail = Array.isArray(err.detail) ? err.detail.map((d: any) => d.msg).join('; ') : err.detail;
    throw new Error(detail || 'API error');
  }
  return res.json();
}
