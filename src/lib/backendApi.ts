const STORAGE_KEY = 'recon.apiBaseUrl';

export function getApiBaseUrl(): string {
  return localStorage.getItem(STORAGE_KEY)?.replace(/\/+$/, '') ?? '';
}

export function setApiBaseUrl(url: string): void {
  const trimmed = url.trim().replace(/\/+$/, '');
  if (trimmed) {
    localStorage.setItem(STORAGE_KEY, trimmed);
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export async function checkBackendHealth(baseUrl: string): Promise<{ ok: true; detail: string }> {
  let response: Response;
  try {
    response = await fetch(`${baseUrl}/health`, { headers: { Accept: 'application/json' } });
  } catch {
    throw new Error('Could not reach the backend. Check the address and that the server allows browser requests.');
  }
  if (!response.ok) throw new Error(`The backend responded with status ${response.status}.`);

  const body: unknown = await response.json().catch(() => null);
  const status = typeof body === 'object' && body !== null ? (body as { status?: unknown }).status : undefined;
  if (status !== 'ok') throw new Error('The address responded, but it did not identify as the AI Recon backend.');
  return { ok: true, detail: 'Backend is online.' };
}

export interface AssistantAnswer {
  answer: string;
}

export async function askAssistant(baseUrl: string, scanId: string, question: string): Promise<AssistantAnswer> {
  let response: Response;
  try {
    response = await fetch(`${baseUrl}/assistant/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ scan_id: scanId, question }),
    });
  } catch {
    throw new Error('Could not reach the AI backend.');
  }
  if (!response.ok) throw new Error(`The AI backend returned an error (status ${response.status}).`);

  const body: unknown = await response.json().catch(() => null);
  const answer = typeof body === 'object' && body !== null ? (body as { answer?: unknown }).answer : undefined;
  if (typeof answer !== 'string' || answer.trim() === '') {
    throw new Error('The AI backend returned an unexpected response.');
  }
  return { answer };
}
