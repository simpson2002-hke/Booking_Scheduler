import { BookingState } from '../types';
import { getInitialState, hydrateState } from './initialData';

const WORKER_API_URL = import.meta.env.VITE_WORKER_API_URL as string | undefined;
const WORKER_API_KEY = import.meta.env.VITE_WORKER_API_KEY as string | undefined;

const getHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (WORKER_API_KEY) {
    headers.Authorization = `Bearer ${WORKER_API_KEY}`;
  }

  return headers;
};

export const isRemotePersistenceEnabled = (): boolean => Boolean(WORKER_API_URL);

const extractRemoteState = (payload: unknown): Partial<BookingState> | null => {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const candidate = payload as { state?: unknown };
  if (candidate.state === null || candidate.state === undefined) {
    return null;
  }

  if (candidate.state && typeof candidate.state === 'object') {
    return candidate.state as Partial<BookingState>;
  }

  return payload as Partial<BookingState>;
};

export const loadRemoteState = async (): Promise<BookingState> => {
  if (!WORKER_API_URL) {
    throw new Error('Remote persistence is not configured. Set VITE_WORKER_API_URL.');
  }

  const response = await fetch(WORKER_API_URL, {
    method: 'GET',
    headers: getHeaders(),
  });

  const payload = await response.json().catch(() => null);

  if (response.status === 404) {
    return getInitialState();
  }

  if (!response.ok) {
    const responseError =
      payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string'
        ? payload.error
        : null;
    throw new Error(responseError ?? `Failed to load remote data (${response.status})`);
  }

  const remoteState = extractRemoteState(payload);
  if (!remoteState) {
    return getInitialState();
  }

  const hydrated = hydrateState(remoteState);
  if (!hydrated) {
    throw new Error('Remote state payload is invalid.');
  }

  return hydrated;
};

export const saveRemoteState = async (state: BookingState): Promise<void> => {
  if (!WORKER_API_URL) {
    throw new Error('Remote persistence is not configured. Set VITE_WORKER_API_URL.');
  }

  const response = await fetch(WORKER_API_URL, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ state }),
  });

  if (!response.ok) {
    throw new Error(`Failed to save remote data (${response.status})`);
  }
};
